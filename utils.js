//some commonly used functions

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

};
