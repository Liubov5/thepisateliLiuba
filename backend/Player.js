class Player{
	name;
	socket_id;
	roomName;
	hp = 100;
	correctWords = [];
	index;
	
	constructor(options){
		this.name = options.name;
		this.socket_id = options.socket_id;
		this.roomName = options.roomName;
		this.index = options.index;
	}
}

module.exports = Player;