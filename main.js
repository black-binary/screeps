tasks = require('tasks');
rooms = require('rooms');
population = require('population');

module.exports.loop = function(){
	for(var roomName in Game.rooms){
		if(Game.rooms[roomName].controller.my){
			rooms.run(roomName);
		}
		tasks.run(roomName);
		population.run(roomName);
	}
};
