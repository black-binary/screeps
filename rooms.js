module.exports = {

	run:function(roomName){
		if(Memory.rooms == undefined){
			Memory.rooms = {};
		}
		if(Memory.rooms[roomName] == undefined){
			Memory.rooms[roomName] = {};
			this.initRoomData(roomName);
		}
		this.initRoomData(roomName);
		this.scanRoomObjects(roomName);
	},

	initRoomData:function(roomName){
		if(Game.rooms[roomName].controller.my){
			var objects = this.scanRoomObjects(roomName);
			var mem = {};
			mem.producedEnergy = 0;
			mem.consumedEnergy = 0;
			mem.collectedEnergy = 0;
			mem.storedEnergy = 0;
			mem.owned = true;
			Memory.rooms[roomName] = mem;
		}else{
			var mem = {};
			var objects = this.scanRoomObjects(roomName);
			mem.owned = false;
			Memory.rooms[roomName] = mem;
		}
	},

	scanRoomObjects: function(roomName){
		var objects = {};
		objects.structures = Game.rooms[roomName].find(FIND_STRUCTURES);
		objects.sources = Game.rooms[roomName].find(FIND_SOURCES);
		objects.constructionSites = Game.rooms[roomName].find(FIND_CONSTRUCTION_SITES, {filter:c => c.my});
		//console.log(Memory.rooms[roomName]);
		Memory.rooms[roomName].objects = objects;
		/*console.log(objects);
		console.log(Memory.rooms[roomName].objects);*/
		return objects;
	},

	markContainerHarvesting(roomName){
		Memory.rooms[roomName].containerHarvesting = true;
	},

	unmarkContainerHarvesting(roomName){
		Memory.rooms[roomName].containerHarvesting = undefined;
	},

	setSubjection(roomName){
		Memory.rooms[roomName].subjection = roomName;
	},

};

