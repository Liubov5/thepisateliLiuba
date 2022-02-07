require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const server = http.createServer(app);
const port = 3000;
const fs = require("fs");
const trie = require("trie-prefix-tree");
const e = require('express');
const io = require("socket.io")(server, {
	cors: {
		origin: process.env.ORIGIN,
	},
});
const Room = require('./Room.js');
const Word = require('./Word.js')
let words;
let myTrie;
let names = ["Пушкин", "Гоголь"]; 
app.use(cors());


//чтение файла переносить не буду, потому что будет каждый раз открываться
fs.readFile("russian_nouns.txt", "utf8", function (error, data) {
	if(process.env.MODE==="local"){
		words = data.split("\r\n");		
	} else {
		words = data.split("\n")
	}
	Word.words = words;
	Word.myTrie = trie(words)
});


io.on("connection", (socket) => {
   
    socket.join("lobby");
    const lobby = io.sockets.adapter.rooms.get("lobby");
    let roomName = "";
    
    
    if (lobby.size === 1) {
        socket.player_index = 0;
		socket.emit("waiting-enemy");       
	} else{     
        socket.player_index = 1;
        for (let socket_id of lobby) {
			roomName += socket_id + "+";
		}

        let room = new Room(roomName); 
		room.generateWord(words, myTrie);
		
        for (let socket_id of lobby) {
			const _socket = io.sockets.sockets.get(socket_id); //поиск в сокетах
			_socket.leave("lobby");
			_socket.join(roomName);
			_socket.room = room;
			let player = room.addPlayer({
				name: names[_socket.player_index],
				index:_socket.player_index,
				socket_id: socket_id,
				roomName
			});	
			//сохраняю в сокет экземпляр себя? чтобы в классе room спокойно вызывать массив правильных слов игрока. Так норм вообще?
			_socket.player = player;    	
		}

		io.to(roomName).emit("room-inited", {players: room.players, word: room.word});
    }

	socket.on('player-guessed-word',(data)=>{
		let status = socket.room.checkWord(data.word);

		if(status){
			socket.room.correctWords.push(data.word) 
			socket.player.correctWords.push(data.word);

			
			//не моё хп должно уменьшаться, а врага.
			let enemy = socket.room.players.filter((player)=>{
				return player.socket_id !== socket.id;			
			});
			
			enemy[0].hp-=10;

					
			data.enemy_hp = enemy[0].hp;
			io.to(socket.room.roomName).emit("player-guessed-word", data);
			checkHp(socket);
		}

	});

	
	socket.on("disconnect", () => {
		console.log("rooms disconnect: ", io.sockets.adapter.rooms);
	});

});


function checkHp(socket){
	socket.room.players.forEach((player)=>{
		if(player.hp <=80){
			io.to(socket.room.roomName).emit("game-over", {
				loserIndex: player.index
			});
		}
	})
}

server.listen(port, (err) => {
	if (err) {
		return console.log("something bad happened", err);
	}
	console.log(`server is listening on ${port}`);
});
