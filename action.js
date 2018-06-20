require('constans.js');

module.exports = {
	move: function(creep){
		var obj = Game.getObjectById(creep.memory.task.target);
		currentRoom = creep.room.name;
		targetRoom = obj.room.name;
		if(currentRoom = targetRoom){
			var range = creep.memory.task.range;
			if(creep.pos.getRangeTo(obj) <= range){
				return false;
			}
			shortMove(creep, obj);
		}else{
			remoteMove(creep);
		}
		return true;
	},
	shortMove: function(creep, obj){
		creep.moveTo(obj);
	},
	remoteMove: function(creep,roomName){
		var exit = creep.pos.findClosestByPath(creep.room.findExitTo(roomName));
		creep.moveTo(exit,{visualizePathStyle:{}});
	},

	containerHarvest: function(creep){
		var source = Game.getObjectById(creep.memory.task.target1)
		return creep.harvest(source);
	},

	harvest: function(creep){
		var source = Game.getObjectById(creep.memory.task.target)
		return creep.harvest(source);
	},

	collectEnergy: function(creep){
		var target = Game.getObjectById(creep.memory.task.target)
		return creep.withdraw(target, RESOUCE_ENERGY);
	},

	storeEnergy: function(creep){
		var target = Game.getObjectById(creep.memory.task.target)
		/*
		var transferStruct = [
			STRUCTURE_EXTENSION,
			STRUCTURE_SPAWN,
			STRUCTURE_TOWER,
			STRUCTURE_LINK,
		];
		var storeStruct = [
			STRUCTURE_CONTAINER,
			STRUCTURE_STORAGE,
		];*/
		var subtype = creep.memory.task.subtype;
		if(subtype == SUBTYPE_TRANSFER_STORE){
			return creep.transfer(target, RESOUCE_ENERGY);
		}else{ //store
			return creep.store(target, RESOUCE_ENERGY);
		}
	},

	upgrade: function(creep){
		var target = Game.getObjectById(creep.memory.task.target)
		return creep.transfer(target, RESOUCE_ENERGY);
	},
};
