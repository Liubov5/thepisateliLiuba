const Player = require('./Player.js');
const Word = require('./Word.js')
class Room{
    roomName;
    players = [];

    //текущее слово
    word = {};

    //слова отгаданные текущего слова
    correctWords = [];

    //все слова раунда, которые были
    words = [];
    
     
    constructor(roomName){
        this.roomName = roomName;
    }
    

    addPlayer(options){
       options.roomName = this.roomName;
        let player = new Player(options);
        this.players.push(player);
        return player;
    }

    generateWord(){
        let word =  new Word();
        let genereted_word = word.generateWord();
        this.word = genereted_word;
        this.words.push(genereted_word.word);
    }

    checkWord(word){
        let index = this.word.variants.indexOf(word);//есть ли в вариантах слово
        let game_index = this.correctWords.indexOf(word); //хранятся вообще все отгаданные слова в игре. 
       
        
        //где будут хранится отгаданные слова одного игрока? Зачем? Чтобы показать его отгаданные слова и в конце показать его слова.       
        return index != -1 && game_index == -1;
    }
    

}

module.exports = Room;