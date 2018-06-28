var tasks = require('tasks');
var rooms = require('rooms');
var creeps = require('creeps');
var population = require('population');
var cleaner = require('cleaner');
var utils = require('utils');

module.exports.loop = function(){
	cleaner.run();
	utils.checkEveryCreep();
	for(var roomName in Game.rooms){
		if(Game.rooms[roomName].controller.my){
			rooms.run(roomName);
			tasks.run(roomName);
			population.run(roomName);
		}
	}
	for(var name in Game.creeps){
		creeps.run(Game.creeps[name]);
	}
};
