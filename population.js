utils = require('utils.js');

function findMaxPriority(queue){
	if(queue.length == 0){
		return undefined;
	}
	var p = 0;
	for(var i in queue){
		if(queue[i].num > 0 && queue[p] < queue[i]){
			p = i;
		}
	}
	return p;
}

function findAndUpdateItem(roomName, role, num){
	var queue = Memory.rooms[roomName].population.queue;
	for(var i in queue){
		if(queue[i].role == role && queue[i].num < num){
			Memory.rooms[roomName].population.queue[i].num = num;
			return true;
		}
	}
	return false;
}

function remove(roomName, id){
	Memory.rooms[roomName].population.queue[id].num-=1;
}

function max(roomName){
	return findMaxPriority(Memory.rooms[roomName].population.queue);
}

function pop(roomName){
	remove(roomName, max(roomName));
}

function push(roomName, item){
	var id = utils.genId();
	item.id = id;
	Memory.rooms[roomName].population.queue[id] = item;
}

function sumUp(roomName, role){
	var count = 0;
	for(var i in Game.creeps){
		if(Game.creeps.subjection==roomName 
		&& Game.creeps.memory.role == role){
			count++;
		}
	}
	return count;
}

function itemExists(roomName, role, num){
	var queue = Memory.rooms[roomName].population.queue;
	for(var i in queue){
		if(queue[i].role == role && queue[i].num >= num){
			return true;
		}
	}
	return false;
}

function getCost(body){
	var cost = 0;
	for(var part in body){
		cost += BODYPART_COST[part];
	}
	return cost;
}

function designBody(roomName, role){
	if(Game.rooms[roomName].controller.level <= 2){
		var energy = Game.rooms[roomName].energyCapacity;
		var base = [WORK,CARRY,MOVE];
		var cost = 200;
		var body = [];
		while(energy >= cost){
			body = body.concat(body,base);
		}
		return body;
	}else{
		
	}
}

function checkPopulation(roomName){
	var rolesPriority = {
		worker:1000,
		harvester:1100,
		hauler:1000,
		upgrader:900,
		guard:1200,
	};
	var strategy = Memory.rooms[roomName].population.strategy;
	for(var role in strategy){
		var num = strategy[role];
		var sum = sumUp(roomName,role);
		if(sum < num){
			var delta = num - sum;
			if(!findAndUpdateItem(roomName, role, delta)){
				var item = {};
				item.role = role;
				item.num = delta;
				item.priority = rolesPriority[role];
				item.body = designBody(roomName, role);
				item.memory = {
					subjection: roomName,
					role: role,
				};
				push(roomName, item);
			}
		}
	}
}

function respawn(roomName){
	var item = max(roomName);
	var spawns = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {
		filter: {structureType: STRUCTURE_SPAWN}
	});
	var flag = false;
	for(var i in spawns){
		if(spawns[i].spawning == undefined){
			spawns.spawnCreep(item.body,utils.genId(),item.memory);
			remove(roomName,item.id);
			flag = true;
		}
	}
	return flag;
}

function feedback(roomName){
	var producedEnergy = Memory.rooms[rooms].producedEnergy;
	var consumedEnergy = Memory.rooms[rooms].consumedEnergy;
	var increseRate = (producedEnergy - consumedEnergy) / producedEnergy;

}

module.exports = {

	run: function(roomName):{
		if(Memory.rooms[roomName].population == undefined){
			this.init(roomName);
		}
		if(Game.time % 50 == 0){
			checkPopulation(roomName);
		}
		respawn(roomName);
	},

	init: function(roomName):{
		var strategy = {};
		strategy.worker = Memory.rooms.objects.sources.length * 2;
		strategy.upgrader = 1;
		Memory.rooms[roomName].population.strategy = strategy;
		Memory.rooms[roomName].population.queue = {};
	},

};

