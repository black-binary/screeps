//some commonly used functions

var alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
module.exports = {
	markContainer: function(container){
		var id = container.id;
		var roomName = container.pos.roomName;
		Memory.containers[roomName].push(id);
	},

	testContainer: function(container){
		var id = container.id;
		var roomName = container.pos.roomName;
	},

	genId: function(){
		var id = '';
		for(var i = 0; i < 15; i++){
			id += alphabet[Math.floor(Math.random() * 36)];
		}
		return id;
	},

};
