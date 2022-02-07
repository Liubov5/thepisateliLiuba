class Word{
    word;
    variants;
    constructor(){
        
    }

    static words;
    static myTie;
    generateWord(){
        let random = Math.floor(Math.random() * Word.words.length);
        this.word = Word.words[random];
        this.variants = Word.myTrie.getSubAnagrams(Word.words[random])
        return {
            word: this.word,
            variants: this.variants,
        };
    }

}

module.exports = Word;