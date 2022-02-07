class Player {
	name;
	scene;
	hp_sprite;
	index;
	socket_id;
	
	/*
		#REFACTOR
		по хорошему сдеклать бы так чтобы не нужно было создавать группу
	*/
	currentWordSprites;
	correctWordSprites;

	hp = 100;
	currentWord = [];
	correctWords = [];

	constructor(options, scene) {
		this.index = Player.players.push(this) - 1;
		this.name = options.name;
		this.roomName = options.roomName;
		this.scene = scene;
		this.socket_id = options.socket_id;
		this.currentWordSprites = this.scene.add.group();
		this.correctWordSprites = this.scene.add.group();
		this.hp_sprite = this.scene.add.text(this.getCoords("hp").x, this.getCoords("hp").y, this.name + ": " + this.hp, { fontFamily: "Arial", fontSize: "30px" });
		
	}

	getCoords(type) {
		let result = {
			x: undefined,
			y: undefined,
		};
		switch (type) {
			case "current":
				result.x = window.innerWidth / 2;
				result.y = this.index === 0 ? window.innerHeight / 2 - 100 : window.innerHeight / 2 + 50;
				break;

			case "correct":
				result.x = this.index === 0 ? 100 : window.innerWidth - 300;
				result.y = 300;
				break;

			case "hp":
				result.x = this.index === 0 ? 100 : window.innerWidth - 300;
				result.y = 200;
				break;

			case "loose":
				result.x = 500;
				result.y = 500;
				break;
		}

		return result;
	}

	redrawCorrectWords() {
		this.correctWordSprites.clear(true, true);

		let step = this.getCoords("correct").y;

		this.correctWords.forEach((correctWord) => {
			let word = this.scene.add.text(this.getCoords("correct").x, step, correctWord, { fontFamily: "Arial", fontSize: "30px" });

			this.correctWordSprites.add(word);

			step += 30;
		});
	}

	checkWord(word) {
		
		//вернуть логику обратно. Первичная проверка, потом отправляю слово на сервер. Иначе, слишком много запросов на сервер
		
		let index = Word.currentWord.variants.indexOf(word);
		let playerIndex = this.correctWords.indexOf(word);
		let enemyIndex = Player.enemy.correctWords.indexOf(word);

		return index != -1 && playerIndex == -1 && enemyIndex == -1;
	}

	clickWord(sprite) {
		this.currentWord.push(sprite);

		this.redrawCurrentWord();

		let currentWordArray = [];

		this.currentWord.forEach((letter) => {
			currentWordArray.push(letter.custom_letter);
		});

		let word = currentWordArray.join("");

		if(this.checkWord(word)){
			socket.emit("player-guessed-word", {
				word,
				index:Player.me.index 
			})
		}
		
	}

	guessWord(word) {
		this.correctWords.push(word);
		this.redrawCorrectWords();

		this.clearCurrentWord();
	}

	clearCurrentWord() {
		this.currentWord = [];
		this.redrawCurrentWord();
	}

	redrawCurrentWord() {
		let step = this.getCoords("current").x;

		this.currentWordSprites.clear(true, true);

		this.currentWord.forEach((sprite) => {
			let letter = this.scene.add.text(step, this.getCoords("current").y, sprite.custom_letter, { fontFamily: "Arial", fontSize: "30px" });

			this.currentWordSprites.add(letter);

			step += 30;
		});
	}

	redrawHp() {
		this.hp_sprite.setText(this.name + ": " + this.hp);
	}

	getHit(hp) {
		this.hp = hp;
		this.redrawHp();
	
	}

	static players = [];
	static myIndex = 0;
	static roomName;
	static bindSockets() {

		
		socket.on("player-guessed-word", (data) => {
			Player.players[data.index].guessWord(data.word);
			
			if (Player.players[data.index].index === Player.me.index) {
				// вот здесь запускать анимацию
				Player.enemy.getHit(data.enemy_hp);
			}else{
				Player.me.getHit(data.enemy_hp);
			}

		});

		

		socket.on("game-over", (data) => {
			console.log(data, Player.me);
			if (Player.players[data.loserIndex].index === Player.me.index) {
				alert("я проиграл ((((");
			} else {
				alert("я выиграл )))))");
			}
		});
	}

	static initPlayers(players, scene) {	
		for(let i=0; i<players.length;i++){
			new Player(players[i],scene);	
		}
		
	}

	static get me() {
		return Player.players[Player.myIndex];
	}

	static get enemy() {
		return Player.players[Player.myIndex === 0 ? 1 : 0];
	}
}
