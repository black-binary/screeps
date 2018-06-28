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
				var task = Memory.tasks[roomName][type][id];
				var target = Game.getObjectById(Memory.tasks[roomName][type][id].target);
				if(target == undefined || type == TYPE_REPAIR && target.hitsMax == target.hits){
					delete Memory.tasks[roomName][type][id];
				}
			}
		}
	}
}

function cleanRooms(){
	for(var roomName in Memory.rooms){
		if(Memory.rooms[roomName].owned){
			if(Game.rooms[roomName]){
				if(!Game.rooms[roomName].controller.my){
					delete Memory.rooms[roomName];
				}
			}else{
				delete Memory.rooms[roomName];
			}
		}
	}
}

module.exports = {
	run:function(){
		cleanRooms();
		cleanTasks();
		cleanCreeps();
	}
};
