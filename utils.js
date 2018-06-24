//some commonly used functions

var alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';

module.exports = {

	markContainer: function(id){
		var container = Game.getObjectById(id);
		var roomName = Memory.rooms[container.pos.roomName].subjection;
		if(!Memory.containers[roomName]){
			Memory.containers[roomName]= {};
		}
		var source = containers.pos.findInRange(FIND_SOURCES,1)[0];
		if(source){
			Memory.containers[roomName][id] = source.id;
		}else{
			console.log("Invalid container. Souces not found.");
		}
	},

	unmarkContainer: function(id){
		var container = Game.getObjectById(id);
		var roomName = Memory.rooms[container.pos.roomName].subjection;
		Memory.containers[roomName][id] = undefined;
	},

	testContainer: function(id){
		var container = Game.getObjectById(id);
		var roomName = Memory.rooms[container.pos.roomName].subjection;
		if(!Memory.containers){
			Memory.containers = {}
		}
		if(!Memory.containers[roomName]){
			Memory.containers[roomName]= {};
		}
		return Memory.containers[id] != undefined;
	},

	genId: function(){
		var id = '';
		for(var i = 0; i < 15; i++){
			id += alphabet[Math.floor(Math.random() * 36)];
		}
		return id;
	},

	checkEveryCreep: function(){
		for(var roomName in Memory.tasks){
			for(var type in Memory.tasks[roomName]){
				for(var id in Memory.tasks[roomName][type]){
					Memory.tasks[roomName][type][id].working = 0;
				}
			}
		}
		for(var roomName in Memory.population){
			for(var role in Memory.population[roomName]){
				Memory.population[roomName][role].current = 0;
			}
		}
		for(var name in Game.creeps){
			var creep = Game.creeps[name];
			if(creep.memory.task){
				var roomName = creep.memory.task.roomName;
				var type = creep.memory.task.type;
				var id = creep.memory.task.id;
				if(Memory.tasks[roomName][type][id]){
					Memory.tasks[roomName][type][id].working += creep.memory.task.working;
				}else{
					delete creep.memory.task;
				}
			}
			var role = creep.memory.role;
			Memory.population[creep.memory.subjection][role].current++;
		}
	},
};

