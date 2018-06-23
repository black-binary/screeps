var utils = require('utils');
require('constants');

function findMaxPriority(roomName){
	var strategy = Memory.population[roomName];
	var result = undefined;
	for(var role in strategy){
		if(strategy[role].current < strategy[role].schedule && (result == undefined || strategy[role].priority > strategy[result].priority)){
			result = role
		}
	}
	return result;
}

function getCost(body){
	var cost = 0;
	for(var part in body){
		cost += BODYPART_COST[part];
	}
	return cost;
}

function designBody(roomName, role){
	var energy = Game.rooms[roomName].energyCapacityAvailable;
	var body = [];
	if(role == 'worker'){
		var base = [WORK,CARRY,MOVE,MOVE];
		var body1 = [WORK,CARRY,MOVE,MOVE];
		for(var cost = 0;cost <= 250 * 4 && energy >= cost;cost += 250){
			body = body.concat(base);
			cost += 250;
		}
	}else if(role == 'hauler'){
		var base = [CARRY,MOVE];
		//<=6 bases
		for(var cost = 0; energy >= cost && cost <= 100 * 5; cost += 100 ){
			body = body.concat(base);
		}
	}else if(role == 'harvester'){
		var body1 = [WORK,WORK,WORK,MOVE,MOVE];
		var body2 = [WORK,WORK,WORK,WORK,MOVE,MOVE];
		var body3 = [WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE];
		if(energy > getCost(body3)){
			body = body3;
		}else if(energy > getCost(body2)){
			body = body2;
		}else if(energy > getCost(body1)){
			body = body1;
		}
	}
	return body;
}

function basicMemory(roomName, role){
	var memory = {};
	memory.subjection = roomName;
	memory.role = role;
	return memory;
}

function respawn(roomName){
	var spawns = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {
		filter: {structureType: STRUCTURE_SPAWN}
	});
	for(var i in spawns){
		var role = findMaxPriority(roomName);
		if(spawns[i].spawning == undefined && role != undefined){
			var body = designBody(roomName, role);
			var memory = basicMemory(roomName, role);
			spawns[i].spawnCreep(body,utils.genId(),{memory:memory});
		}
	}
}

function feedback(roomName){
	var producedEnergy = Memory.rooms[roomName].producedEnergy;
	var consumedEnergy = Memory.rooms[roomName].consumedEnergy;
	var increaseRate = (producedEnergy - consumedEnergy) / producedEnergy;
	var population = Memory.population[roomName];
	if(increaseRate < 0){
		population.upgrader.schedule = Math.max(population.upgrader - 1, 1);
		population.builder.schedule = Math.max(population.builder - 1, 0);
	}else if(increaseRate > 0.2){
		population.upgrader.schedule++;
	}
	Memory.population[roomName] = population;
}

function updatePopulation(roomName){
	var population = Memory.population[roomName];
	if(Memory.rooms[roomName].containerHarvesting){
		population.worker.schedule = 2 + Math.ceil(Memory.rooms[roomName].objects.constructionSites/4);
		population.harvester.schedule = Memory.rooms[roomName].objects.sources.length;
		population.hauler.schedule = 2;
	}else{

	}
}


module.exports = {

	run: function(roomName){
		if(Memory.population == undefined){
			Memory.population = {};
		}
		if(Memory.population[roomName]== undefined){
			this.init(roomName);
		}
		//feedback(roomName);
		respawn(roomName);
	},

	init: function(roomName){
		var rolesPriority = {
			worker:1000,
			harvester:1100,
			hauler:1000,
			upgrader:900,
			guard:800,
			remoteHarvester:900
		};
		var population = {};
		for(var role in rolesPriority){
			population[role] = {};
			population[role].current = 0;
			population[role].schedule = 0;
			population[role].priority = rolesPriority[role];
		}
		population.worker.schedule = Memory.rooms[roomName].objects.sources.length * 3 + 1;
		//population.upgrader.schedule = 1;
		Memory.population[roomName] = population;
	},

	adjust: function(roomName, role, delta){
		Memory.population[roomName][role].schedule += delta;
	},
	wirte: function(roomName, role, value){
		Memory.population[roomName][role].schedule = value;
	},

};

