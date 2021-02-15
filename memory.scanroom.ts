const Debugger = require("utils.debug");
const debug = new Debugger("memory.scanroom");

const SchedCreepControl = require("scheduler.creepcontrol");
const SchedBootstrapDirector = require("scheduler.bootstrap");

module.exports = function() {
    // Room Memory Init <== Consider moving this elsewhere.

    const DIR_NONE = 0;
    const DIR_BOOTSTRAP = 1;
    const DIR_RESERVE = 2;
    const DIR_COLONIZE = 3;

    this.scan_visible_rooms = function() {
        Memory.rooms = Memory.rooms || {};
        // for (let roomKey in Game.rooms) {
        //     this.scan_room(roomkey);
        // }
        if (Game.rooms["sim"] != undefined) {
            this.scan_room("sim");
        }
    }

    this.scan_room = function(room_name, reset) {
        let room = Game.rooms[room_name];
        if (!room) {
            return;
        }
        if (reset || room.memory.sources == undefined) {
            room.memory.sources = [];
            let sources = room.find(FIND_SOURCES);
            for (let source in sources) {
                room.memory.sources.push(sources[source].id);
            }
        }
        if (reset || room.memory.minerals == undefined) {
            room.memory.minerals = [];
            let minerals = room.find(FIND_MINERALS);
            for (let m in minerals) {
                let mineral = minerals[m];
                room.memory.minerals.push({
                    id: mineral.id,
                    mineralType: mineral.mineralType,
                    density: mineral.density
                })
            }
        }
        if (reset || room.memory.controller == undefined) {
            room.memory.controller = room.controller ? room.controller.id : null;
        }
        if (reset || room.memory.spawns == undefined || room.memory.spawns.length == 0) {
            room.memory.spawns = [];
            let spawns = room.find(FIND_MY_SPAWNS)
            for (let s in spawns) {
                room.memory.spawns.push(spawns[s].id); // TODO FIX THIS LATER RE UPDATING CHANGES
            }
        }
        if (reset || room.memory.my == undefined) {
            room.memory.my = room.controller ? room.controller.my : false;
        }
        if (reset || room.memory.owner == undefined) {
            room.memory.owner = room.controller ? room.controller.owner.username : null;
        }
    }

    this.evaluate_all = function() {
        for (let room in Memory.rooms) {
            this.evaluate_room(room, true);
        }
    }

    this.evaluate_room = function(room) {
        let directive = "";
        if (!Memory.rooms[room].directing) {
            Memory.rooms[room].directing = Memory.rooms[room].my;
        }
        if (Memory.rooms[room] && Memory.rooms[room].directing) {
            let spawnnum = Memory.rooms[room].spawns.length;
            if (spawnnum > 0) {
                directive = DIR_BOOTSTRAP;
            } else {
                directive = DIR_RESERVE;
            }
            Memory.rooms[room].directive = directive;
        }
    }


    this.run_rooms = function() {
        for (let room in Memory.rooms) {
            if (Memory.rooms[room].directing) {
                let creepcontrol;
                let director;
                switch (Memory.rooms[room].directive) {
                    case DIR_NONE:
                        // do nothing
                        break;
                    case DIR_BOOTSTRAP:
                        debug.logInfo("Running Bootstrap Creepcontrol", "run_rooms")
                        creepcontrol = new SchedCreepControl(Game.rooms[room]);
                        director = new SchedBootstrapDirector(Game.rooms[room]);
                        // do something bootstrappy
                        break;
                    case DIR_RESERVE:
                        break;
                    case DIR_COLONIZE:
                        break;
                }
                if (director) director.run();
                if (creepcontrol) creepcontrol.run();
            }
        }
    }



    // END MEMORY CLEANUP    
    return this;
}