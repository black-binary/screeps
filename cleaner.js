function cleanCreeps(){
	for(var name in Memory.creeps){
		if(Game.creeps[name] == undefined){
			delete Memory.creeps[name];
		}
	}
}

function cleanTasks(){
	for(var roomName in Memory.tasks){
		for(var type in Memory.tasks[roomName]){
			for(var id in Memory.tasks[roomName][type]){
				if(Game.getObjectById(Memory.tasks[roomName][type][id].target) == undefined){
					delete Memory.tasks[roomName][type][id];
				}
			}
		}
	}
}

module.exports = {
	run:function(){
		cleanTasks();
		cleanCreeps();
	}
}
