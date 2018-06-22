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

