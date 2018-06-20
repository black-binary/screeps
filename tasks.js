require('constans.js');
var utils = require('utils.js');

var alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';

function findTask(tasks, target){
	for(i in tasks){
		if(tasks[i].target == target){
			return i;
		}
	}
	return undefined;
}

function genId(){
	var id = '';
	for(var i = 0; i < 15; i++){
		id += alphabet[Math.floor(Math.random() * 36)];
	}
	return id;
}

function basicTask(roomName){
	return {
		id: genId(),
		roomName: roomName,
	}
}

module.exports = {
	updateTasks:function(roomName){
		var structures = Memory.rooms[roomName].objects.structures;
		var constructionSites = Memory.rooms[roomName].objects.constructionSites;

		//build
		for(i in constructionSites){
			constructionSite = constructionSites[i];
			var taskId = findTask(Memory.tasks[roomName].build,constructionSite.id);
			if(taskId){
				Memory.tasks[roomName].build[taskId].progress = constructionSite.progress;
			}else{
				var task = basicTask(roomName);
				task.type = TYPE_BUILD;
				task.priority = 900;
				task.progress = 0;
				task.target = constructionSite.id;
				task.roomName = roomName;
				Memory.tasks[roomName].build[task.id] = task;
			}
		}

		//store/collect
		for(i in structures){
			var structure = structures[i];
			var structureType = structures.structureType;

			//store
			if(structureType == STRUCTURE_EXTENSION
			|| structureType == STRUCTURE_SPAWN
			|| structureType == STRUCTURE_CONTAINER
			|| structureType == STRUCTURE_STORAGE
			|| structureType == STRUCTURE_LINK){
				var taskId = findTask(Memory.tasks[roomName].store,structure.id);
				var task = basicTask(roomName);
				if(structureType == STRUCTURE_EXTENSION || structureType == STRUCTURE_SPAWN){
					if(taskId){
						Memory.tasks[roomName].store[taskId].progress = structure.energyCapacity - structure.energy;
					}else{
						task.type = TYPE_STORE;
						task.subtype = SUBTYPE_TRANSFER_STORE;
						task.priority = 1000;
						task.target = structure.id;
						task.progress = structure.energyCapacity - structure.energy;
					}
				}else if(structureType == STRUCTURE_STORAGE
					|| structureType == STRUCTURE_LINK
					|| (structureType == STRUCTURE_CONTAINER 
						&& !utils.testContainer(structure)) ){
					if(taskId){
						Memory.tasks[roomName].store[taskId].progress = structure.storeCapacity - structure.store[RESOUCE_ENERGY];
					}else{
						task.type = TYPE_STORE;
						task.subtype = SUBTYPE_STORE_STORE;
						task.priority = 900;
						task.target = structure.id;
						task.progress = structure.storeCapacity - structure.store[RESOUCE_ENERGY];
					}
				}
				task.roomName = roomName;
				Memory.tasks[roomName].store[task.id] = task;
			}

			//collect
			if(structureType == STRUCTURE_CONTAINER || structureType == STRUCTURE_STORAGE 
			{
				var taskId = findTask(Memory.tasks[roomName].collect,structure.id);
				if(taskId){
					Memory.tasks[roomName].collect[taskId].progress = structure.store[RESOUCE_ENERGY];
				}else{
					var task = basicTask(roomName);
					tasks.type = TYPE_COLLECT;
					task.priority = 1000;
					task.target = structure.id
					task.roomName = roomName;
					task.progress = structure.store[RESOUCE_ENERGY];
					Memory.tasks[roomName].collect[task.id] = task;
				}
			}

			//repair
			if(structureType != STRUCTURE_WALL && structureType != STRUCTURE_RAMPART
				&& (structure.hitsMax - structure.hits) >= structure.hitsMax * 0.1){
				var taskId = findTask(Memory.tasks[roomName].repair,structure.id);
				if(taskId){
					Memory.tasks[roomName].repair[taskId].progress = structure.store[RESOUCE_ENERGY];
				}else{
					var task = basicTask(roomName);
					task.type = TYPE_REPAIR;
					task.priority = 1100;
					task.target = structure.id;
					task.roomName = roomName;
					task.progress = structure.hitsMax - structure.hits;
					Memory.tasks[roomName].repair[task.id] = task;
				}
			}
		}
	},

	initStaticTasks:function(roomName):{ //run once
		var sources = Memory.rooms[roomName].objects.sources;
		Memory.tasks[roomName] = {};
		Memory.tasks[roomName].harvest = [];
		tasksList = []
		for(i in sources){
			var task = basicTask(roomName);
			var id = task.id;
			task.type = TYPE_HARVEST;
			task.subtype = SUBTYPE_NORMAL_HARVEST;
			task.priority = 1000;
			task.target = sources[i].id;
			task.require = 2;
			task.roomName = roomName;
			tasksList[roomName].harvest[id] = task;
		}

		var controller = Game.room[roomName].controller;
		var task = basicTask(roomName);
		var id = task.id;
		task.type = TYPE_UPGRADE;
		task.priority = 1000;
		task.target = controller.id;
		task.require = 1;
		task.roomName = roomName;
		tasksList[roomName].upgrade[id] = task;

		Memory.tasks[roomName] = tasksList;
	},

};

