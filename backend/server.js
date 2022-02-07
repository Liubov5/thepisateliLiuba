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
let words;
let myTrie;

app.use(cors());

fs.readFile("russian_nouns.txt", "utf8", function (error, data) {
	if(process.env.MODE==="local"){
		words = data.split("\r\n");		
	} else {
		words = data.split("\n")
	}
	myTrie = trie(words);
});

io.on("connection", (socket) => {
	socket.join("lobby");

	const lobby = io.sockets.adapter.rooms.get("lobby"); //хранятся айди сокетов
	let index;
	let roomName = "";

	if (lobby.size === 1) {
		index = 0;
		console.log("jdem vraga...");
	} else {
		index = 1;
		for (let socket_id of lobby) {
			roomName += socket_id + "+";
		}
		for (let socket_id of lobby) {
			const _socket = io.sockets.sockets.get(socket_id); //поиск в сокетах
			_socket.leave("lobby");
			_socket.join(roomName);
		}
		//отправили всем название комнаты, зачем? пока не вижу необходимости
		io.to(roomName).emit("room-inited", {
			roomName,
			word: getWord(),
		});
	}
	console.log("rooms: ", io.sockets.adapter.rooms);

	socket.emit("player-inited", {
		index,
		socket_id: socket.id,
	});

	socket.on("player-guessed-word", (room, data) => {
		// делать проверку на хп
		io.to(room).emit("player-guessed-word", data);
	});
	//отправили в индекс to(room)

	// #TODO: понять почему не видно их на фронте
	// socket.emit("debug", io.sockets.adapter.rooms);

	socket.on("game-over", (data) => {
		// #TODO: ПОЧЕМУ ЭТО РАБОТАЕТ????
		io.to(data.roomName).emit("game-over", {
			loserIndex: data.loserIndex,
		});
	});

	socket.on("disconnect", () => {
		console.log("rooms disconnect: ", io.sockets.adapter.rooms);
	});
});

/*app.get("/get-word", (request, response) => {
	let random = Math.floor(Math.random() * words.length);
	response.json({
		word: words[random],
		variants: myTrie.getSubAnagrams(words[random]),
	});
	
});*/

function getWord() {
	let random = Math.floor(Math.random() * words.length);
	return {
		word: words[random],
		variants: myTrie.getSubAnagrams(words[random]),
	};
}

server.listen(port, (err) => {
	if (err) {
		return console.log("something bad happened", err);
	}
	console.log(`server is listening on ${port}`);
});
