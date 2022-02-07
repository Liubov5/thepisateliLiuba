class Word {
	sprites;
	scene;
	variants;

	constructor(wordOptions, scene, y) {
		this.scene = scene;
		this.sprites = scene.add.group();
		this.variants = wordOptions.variants;

		Word.currentWord = this;
		let arr = wordOptions.word.split("");

		let x = 100;

		for (let i = 0; i < arr.length; i++) {
			let index = Word.dictionary.ru.indexOf(arr[i]);
			let sprite = scene.add.sprite(x, y, "letters", index).setInteractive();
			this.sprites.add(sprite);

			x += 120;

			sprite.custom_letter = arr[i];

			sprite.on("pointerdown", function (e) {
				scene.input.mouse.disableContextMenu();

				Player.me.clickWord(this);
				
			});
		}
	}

	static dictionary = {
		ru: ["a", "б", "в", "г", "д", "е", "ё", "ж", "з", "и", "й", "к", "л", "м", "н", "о", "п", "р", "с", "т", "у", "ф", "х", "ц", "ч", "ш", "щ", "ъ", "ы", "ь", "э", "ю", "я"],
	};

	static currentWord;

}
