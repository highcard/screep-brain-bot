/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.miner');
 * mod.thing == 'a thing'; // true
 */
const Debugger = require("utils.debug");
const debug = new Debugger("role.miner");

module.exports = function(creep) {
    const set_working = function() {
        if (creep.memory.working == undefined) {
            creep.memory.working = false;
        }
        if (!creep.memory.working) {
            let target = Game.getObjectById(creep.memory.put_target);
            if (!target) {
                set_put_target();
                return;
            }
            if (creep.pos.isEqualTo(target)){
                creep.memory.working = true;
            }
        }
    }

    const set_get_target = function() {
        if (creep.memory.home_room == undefined || creep.memory.home_room == "" ) {
            creep.memory.home_room = creep.room.name;
        };
        let room = Game.rooms[creep.memory.home_room];
        let sources = room.find(FIND_SOURCES);
        let target;
        for (let s in sources) {
            let miners = _.filter(Game.creeps, 
                (c) => c.memory.home_room == room.name 
                && c.memory.role == "miner"
                && c.memory.get_target == sources[s].id);
            if (miners.length == 0) {
                target = sources[s];
                break;
            }
        }
        if (target) {
            creep.memory.get_target = target.id;
        }
    }

    const set_put_target = function() {
        if (!creep.memory.get_target) {
            set_get_target();
        }
        if (creep.memory.home_room == undefined || creep.memory.home_room == "" ) {
            creep.memory.home_room = creep.room.name;
        };
        let source = Game.getObjectById(creep.memory.get_target);
        let targets = source.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_CONTAINER});
        let target = targets[0];        
        if (!target) {
            debug.logError("no put_target found", "set_put_target");
            creep.memory.put_target == null;
        }
        creep.memory.put_target = target.id;
    }

    this.run = function() {
        set_working();
        if (creep.memory.working) {
            let target_source = Game.getObjectById(creep.memory.get_target);
            let target_container = Game.getObjectById(creep.memory.put_target);
            creep.harvest(target_source);
            creep.transfer(target_container, RESOURCE_ENERGY);
        } else {
            let target_container = Game.getObjectById(creep.memory.put_target);
            creep.moveTo(target_container);
        }
        creep.say("⛏");
    }
}