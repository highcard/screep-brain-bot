// import modules

const Debugger = require("utils.debug");
const debug = new Debugger("main");

const SchedSpawnControl = require("scheduler.roomqueue");
const SchedLayoutControl = require("scheduler.roomlayout");
const SchedCreepControl = require("scheduler.creepcontrol")

const WorldMapControl = require("map.evaluate");

module.exports.loop = function () {

    //let mapeval = new WorldMapControl();
    //mapeval.run();

    // BEGIN MEMORY CLEANUP -- Move this stuff elsewhere 
    // Creep memory cleanup
    for (let memCreepKey in Memory.creeps) {
        if(Game.creeps[memCreepKey] == undefined) {
            Memory.creeps[memCreepKey] = undefined;
        }
    }

    // Room Memory Init <== Consider moving this elsewhere.
    Memory.rooms = Memory.rooms || {};
    for (let roomKey in Game.rooms) {
        let curRoom = Game.rooms[roomKey];     
        if (curRoom.memory.sources == undefined) {
            curRoom.memory.sources = [];
            let sources = curRoom.find(FIND_SOURCES);
            for (let source in sources) {
                curRoom.memory.sources.push(sources[source].id);
            }
        }
        if (curRoom.memory.minerals == undefined) {
            curRoom.memory.minerals = [];
            let minerals = curRoom.find(FIND_MINERALS);
            for (let m in minerals) {
                let mineral = minerals[m];
                curRoom.memory.minerals.push({
                    id: mineral.id,
                    mineralType: mineral.mineralType,
                    density: mineral.density
                })
            }
        }
        if (curRoom.memory.controller == undefined) {
            curRoom.memory.controller = curRoom.controller ? curRoom.controller.id : null;
        }
        if (curRoom.memory.my == undefined) {
            curRoom.memory.my = curRoom.controller ? curRoom.controller.my : false;
        }
        if (curRoom.memory.owner == undefined) {
            curRoom.memory.owner = !(curRoom.controller && curRoom.controller.owner) ? "none" : curRoom.controller.owner.username;
        }
    }
    // END MEMORY CLEANUP

    // Execute directives for all rooms
    for (let room in Game.rooms) {
        let curRoom = Game.rooms[room];
        var spawners = curRoom.find(FIND_MY_STRUCTURES, {filter: s => s.structureType == STRUCTURE_SPAWN});
        if (spawners.length == 0) { // HACK to only run room directives on rooms with spawners. Rethink this.
            continue;
        }        

        let roomlayout = new SchedLayoutControl(curRoom);
        let roomcontrol = new SchedSpawnControl(curRoom);
        let creepcontrol = new SchedCreepControl(curRoom);

        roomlayout.run();
        roomcontrol.run();
        creepcontrol.run();

    }
};