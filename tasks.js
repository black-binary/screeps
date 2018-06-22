require('constants');
var utils = require('utils');

function findTask(tasks, target){
	for(var i in tasks){
		if(tasks[i].target == target){
			return i;
		}
	}
	return undefined;
}

function basicTask(roomName){
	return {
		id: utils.genId(),
		roomName: roomName,
		range: 1,
		working: 0,
		requiring: 9999999,
	}
}

module.exports = {

	run: function(roomName){
		if(Memory.tasks == undefined){
			Memory.tasks = {};
		}
		if(Memory.tasks[roomName] == undefined){
			this.initStaticTasks(roomName);
		}
		this.updateTasks(roomName);
	},

	updateTasks:function(roomName){
		var sources = Memory.rooms[roomName].objects.sources;
		var structures = Memory.rooms[roomName].objects.structures;
		var constructionSites = Memory.rooms[roomName].objects.constructionSites;
		//harvest
		for(var i in sources){
			var taskId = findTask(Memory.tasks[roomName].harvest,sources[i].id);
			if(taskId){
				continue;
			}else{
				var task = basicTask(roomName);
				task.type = TYPE_HARVEST;
				task.subtype = SUBTYPE_NORMAL_HARVEST;
				task.priority = 1000;
				task.target = sources[i].id;
				task.requiring = 3;
				task.roomName = roomName;
				Memory.tasks[roomName].harvest[task.id] = task;
			}
		}

		//build
		for(var i in constructionSites){
			constructionSite = constructionSites[i];
			var taskId = findTask(Memory.tasks[roomName].build,constructionSite.id);
			if(taskId){
				Memory.tasks[roomName].build[taskId].requiring = constructionSite.progressTotal - constructionSite.progress;
			}else{
				var task = basicTask(roomName);
				task.type = TYPE_BUILD;
				task.priority = 900;
				task.requiring = constructionSite.progressTotal;
				task.target = constructionSite.id;
				task.roomName = roomName;
				task.range = 3;
				Memory.tasks[roomName].build[task.id] = task;
			}
		}

		//store/collect
		for(var i in structures){
			var structure = structures[i];
			var structureType = structure.structureType;

			//store
			if(structureType == STRUCTURE_EXTENSION || structureType == STRUCTURE_SPAWN || structureType == STRUCTURE_CONTAINER || structureType == STRUCTURE_STORAGE || structureType == STRUCTURE_LINK){
				var taskId = findTask(Memory.tasks[roomName].store,structure.id);
				var task = basicTask(roomName);
				if(structureType == STRUCTURE_EXTENSION || structureType == STRUCTURE_SPAWN){
					if(taskId){
						Memory.tasks[roomName].store[taskId].requiring = structure.energyCapacity - structure.energy;
					}else{
						task.type = TYPE_STORE;
						task.subtype = SUBTYPE_TRANSFER_STORE;
						task.priority = 1200;
						task.target = structure.id;
						task.requiring = structure.energyCapacity - structure.energy;
						Memory.tasks[roomName].store[task.id] = task;
					}
				}else if(structureType == STRUCTURE_STORAGE || structureType == STRUCTURE_LINK || (structureType == STRUCTURE_CONTAINER && !utils.testContainer(structure)) ){
					if(taskId){
						Memory.tasks[roomName].store[taskId].requiring = structure.storeCapacity - structure.store[RESOURCE_ENERGY];
					}else{
						task.type = TYPE_STORE;
						task.subtype = SUBTYPE_STORE_STORE;
						task.priority = 900;
						task.target = structure.id;
						task.requiring = structure.storeCapacity - structure.store[RESOURCE_ENERGY];
						Memory.tasks[roomName].store[task.id] = task;
					}
				}
			}

			//collect
			if(structureType == STRUCTURE_CONTAINER || structureType == STRUCTURE_STORAGE)
			{
				var taskId = findTask(Memory.tasks[roomName].collect,structure.id);
				if(taskId){
					Memory.tasks[roomName].collect[taskId].requiring = structure.store[RESOURCE_ENERGY];
				}else{
					var task = basicTask(roomName);
					tasks.type = TYPE_COLLECT;
					task.priority = 1000;
					task.target = structure.id
					task.roomName = roomName;
					task.requiring = structure.store[RESOURCE_ENERGY];
					Memory.tasks[roomName].collect[task.id] = task;
				}
			}

			//repair
			if(structureType != STRUCTURE_WALL && structureType != STRUCTURE_RAMPART && (structure.hitsMax - structure.hits) >= structure.hitsMax * 0.1){
				var taskId = findTask(Memory.tasks[roomName].repair,structure.id);
				if(taskId){
					Memory.tasks[roomName].repair[taskId].requiring = structure.hitsMax - structure.hits 
				}else{
					var task = basicTask(roomName);
					task.type = TYPE_REPAIR;
					task.priority = 970;
					task.target = structure.id;
					task.roomName = roomName;
					task.requiring = structure.hitsMax - structure.hits;
					Memory.tasks[roomName].repair[task.id] = task;
				}
			}
		}
	},

	initStaticTasks:function(roomName){ //run once
		var tasksList = {
			harvest:{},
			build:{},
			repair:{},
			upgrade:{},
			store:{},
			collect:{},
			fight:{},
		};

		var controller = Game.rooms[roomName].controller;
		var task = basicTask(roomName);
		task.type = TYPE_UPGRADE;
		task.priority = 950;
		task.target = controller.id;
		task.requiring = 1;
		task.roomName = roomName;
		task.range = 3;
		tasksList.upgrade[task.id] = task;

		var task1 = basicTask(roomName);
		task1.type = TYPE_UPGRADE;
		task1.priority = 700;
		task1.target = controller.id;
		task1.requiring = 9999999;
		task1.roomName = roomName;
		task1.range = 3;
		tasksList.upgrade[task1.id] = task1;

		Memory.tasks[roomName] = tasksList;
	},

};

