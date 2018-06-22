tasks = require('tasks');
rooms = require('rooms');
creeps = require('creeps');
population = require('population');
cleaner = require('cleaner');

module.exports.loop = function(){
	cleaner.run();
	for(var roomName in Game.rooms){
		if(Game.rooms[roomName].controller.my){
			rooms.run(roomName);
		}
		tasks.run(roomName);
		population.run(roomName);
	}
	for(var name in Game.creeps){
		creeps.run(Game.creeps[name]);
	}
};
