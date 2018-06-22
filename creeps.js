require('constants');
action = require('action');

function findMaxPriority(tasks){
	if(tasks.length == 0){
		return undefined;
	}
	var p = tasks[0];
	for(var i in tasks){
		if(tasks[i].priority > p.priority){
			p = tasks[i];
		}
	}
	return p;
}

function isFull(creep){
	return _.sum(creep.carry) == creep.carryCapacity;
}

function isEmpty(creep){
	return _.sum(creep.carry) == 0;
}

function isFixed(creep){
	var s = Game.getObjectById(creep.task.target)
	return s.hits == s.hitsMax;
}

module.exports = {
	run: function(creep){
		if(creep.memory.task){
			if(this.processTask(creep)){ //if its job is done, find another job
				this.finishTask(creep);
				if(!this.allocateTask(creep)){
					creep.say('idle');
				}
			}
		}else{
			if(this.allocateTask(creep)){
				this.processTask(creep);
			}else{
				creep.say('idle');
			}
		}
	},

	allocateTask:function(creep){
		var tasks = this.avalibleTasks(creep);
		if(tasks.length > 0 ){
			this.acceptTask(creep,findMaxPriority(tasks));
			return true; //successful
		}else{
			return false;
		}
	},

	avalibleTasks:function(creep){
		var energyCarrying = (creep.carry[RESOURCE_ENERGY] > 0);
		var roomName = creep.memory.subjection;
		var allTasks = Memory.tasks[roomName];
		var result = [];
		if(creep.memory.role == 'worker'){
			if(energyCarrying){ //to do things requiring energy
				for(var i in allTasks){
					for(var j in allTasks[i]){
						var task = allTasks[i][j];
						if((i == TYPE_STORE || i == TYPE_BUILD || i == TYPE_REPAIR || i == TYPE_UPGRADE) && (task.working < task.requiring)){
							result.push(task);
						}
					}
				}
			}else{  //harvest/collect
				if(Memory.rooms[roomName].containingHarvest){
					for(var i in allTasks){ 
						for(var j in allTasks[i]){
							var task = allTasks[i][j];
							if(i == TYPE_COLLECT && task.working < task.requiring){
								result.push(task);
							}
						}
					}
				}else{
					for(var i in allTasks){ 
						for(var j in allTasks[i]){
							var task = allTasks[i][j];
							if((i == TYPE_HARVEST || i == TYPE_COLLECT) && task.working < task.requiring){
								result.push(task);
							}
						}
					}
				}
			}
		}else if(creep.role == 'harvester'){
			var tasks = allTasks.harvest;
			for(var id in tasks){
				var task = tasks[id];
				if(task.working < 1){
					result.push(task);
					break;
				}
			}
		}else if(creep.role == 'hauler'){
			var tasks = _.concat(allTasks.store, allTasks.collect);
			for(var id in tasks){
				if(task.working < task.requiring){
					result.push(task);
				}
			}
		}
		return result;
	},

	acceptTask: function(creep, task){
		creep.memory.task = task;
		if(task.type == TYPE_HARVEST || task.type == TYPE_UPGRADE){
			Memory.tasks[task.roomName][task.type][task.id].working += 1;
			creep.memory.task.working = 1;
		}else{
			Memory.tasks[task.roomName][task.type][task.id].working += creep.carry[RESOURCE_ENERGY];
			creep.memory.task.working = creep.carry[RESOURCE_ENERGY];  //a trick !!
		}
	},

	finishTask: function(creep){
		delete creep.memory.task;
	},

	processTask: function(creep){ //return true if the job done
		var task = creep.memory.task;
		if(action.move(creep)){
			return false;
		}
		if(task.type == TYPE_HARVEST){
			if(task.subtype == SUBTYPE_NORMAL_HARVEST || task.subtype == SUBTYPE_REMOTE_HARVEST){
				action.harvest(creep);
			}else{
				action.containerHarvest(creep);
			}
			if(isFull(creep)){
				return true;
			}
		}else if(task.type == TYPE_COLLECT){
			if(isFull(creep)){
				return true;;
			}
		}else if(task.type == TYPE_STORE){
			if(action.storeEnergy(creep) != OK){
				return true;
			}
		}else if(task.type == TYPE_UPGRADE){
			if(action.upgrade(creep) != OK){
				return true;
			}
		}else if(task.type == TYPE_BUILD){
			if(action.build(creep) != OK){
				return true;
			}
		}else if(task.type == TYPE_REPAIR){
			if(action.repair(creep) != OK){
				return true;
			}
		}
		return false;
	},
};

