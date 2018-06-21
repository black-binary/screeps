require('constans');
action = require('action');

function findMaxPriority(tasks){
	if(tasks.length == 0){
		return undefined;
	}
	var p = tasks[0];
	for(var i in tasks){
		if(tasks[i].priority < p.priority){
			p = tasks[i];
		}
	}
	return p;
}

function isFull(creep){
	return creep.carry.sum() == creep.carryCapacity;
}

function isEmpty(creep){
	return creep.carry.sum() == 0;
}

module.exports = {
	run: function(creep){
		if(creep.memory.task){
			if(processTask(creep)){ //if its job is done, find another job
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
			this.acceptTask(creep.findMaxPriority(tasks));
			return true; //successful
		}else{
			return false;
		}
	},

	avalibleTasks:function(creep){
		var energyCarrying = (creep.carry[RESOUCE_ENERGY] > 0);
		var roomName = creep.pos.roomName;
		var allTasks = Memory.tasks[roomName];
		var result = [];
		if(creep.memory.role == 'worker'){
			if(energyCarrying){ //to do things requiring energy
				for(var i in allTasks){
					for(var j in allTasks[j]){
						var task = allTasks[i][j];
						var type = task.type;
						if(type == TYPE_STORE || type == TYPE_BUILD
						|| type == TYPE_REPAIR || type == TYPE_UPGRADE
						&& task.schedule < task.progress ){
							result.push(task);
						}
					}
				}
			}else{  //harvest/collect
				for(var i in allTasks){ 
					for(var j in allTasks[j]){
						var task = allTasks[i][j];
						var type = task.type;
						if(type == TYPE_HARVEST || type == TYPE_COLLECT
						&& task.schedule < task.progress){
							result.push(task);
						}
					}
				}
			}
		}else if(creep.role == 'harvester'){

		}else if(creep.role == 'hauler'){

		}
		return result;
	},

	acceptTask: function(creep, task){
		creep.memory.task = task;
		if(task.type == TYPE_HARVEST){
			Memory.tasks[task.roomName][task.type][task.id].working += 1;
		}else{
			Memory.tasks[task.roomName][task.type][task.id].progress += creep.capacity[RESOUCE_ENERGY];
			creep.memory.task.progress = creep.capacity[RESOUCE_ENERGY];  //a trick !!
		}
	},

	finishTask: function(creep){
		var task = creep.memory.task;
		if(task.type == TYPE_HARVEST){
			Memory.tasks[task.roomName][task.type][task.id].working -= 1;
		}else{
			Memory.tasks[task.roomName][task.type][task.id].progress -= creep.task.progress;
		}
		delete creep.memory.task;
		creep.memory.task = undefined;
	},

	processTask: function(creep){ //return true if the job done
		var task = creep.task;
		if(action.move(creep)){
			return;
		}
		if(task.type == TYPE_HARVEST){
			if(task.subtype == SUBTYPE_NORMAL_HARVEST
			|| task.subtype == SUBTYPE_REMOTE_HARVEST){
				action.harvest(creep);
			}else{
				action.containerHarvest(creep);
			}
			if(isFull(creep)){
				return true;
			}
		}else if(task.type == TYPE_COLLECT){
			action.collectEnergy(creep);
			if(isEmpty(creep)){
				return true;
			}
		}else if(task.type == TYPE_STORE){
			action.storeEnergy(creep);
			if(isEmpty(creep)){
				return true;
			}
		}else if(task.type == TYPE_UPGRADE){
			action.upgrade(creep);
			if(isEmpty(creep)){
				return true;
			}
		}else if(task.type == TYPE_BUILD){
			action.build(creep);
			if(isEmpty(creep)){
				return true;
			}
		}else if(task.type == TYPE_REPAIR){
			action.repair(creep);
			if(isEmpty(creep)){
				return true;
			}
		}
		return false;
	},

};
