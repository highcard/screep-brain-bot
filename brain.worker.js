/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.worker');
 * mod.thing == 'a thing'; // true
 */
const Debugger = require("utils.debug");
const debug = new Debugger("role.worker");

module.exports = function(creep) {

    const TASK_BUILDER = "builder";
    const TASK_CONTROLLER = "controller";
    const TASK_SPAWNER = "spawner";
    const TASK_REPAIR = "repairer";
    const TASK_WALLREPAIR = "wallrepair";

    const TARGET_SOURCE = 1;
    const TARGET_CONTAINER = 2;
    const TARGET_DROPPED = 3;
    const TARGET_TOMB = 4;

    const set_working = function() {
        if (creep.memory.working == undefined) {
            creep.memory.working = true;
        }
        if (creep.memory.working) {
            if (creep.carry[RESOURCE_ENERGY] == 0) {
                creep.memory.working = false;
                clear_task();
            }
        } else {
            if (creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) {
                creep.memory.working = true;
                clear_get();
            }
        }
    }

    const set_get_target_source = function() {    
        let room = Game.rooms[creep.memory.home_room];
        let sources = room.memory.sources;
        let room_creeps = _.filter(Game.creeps, function(c) {
            return c.memory.home_room == creep.memory.home_room;
        });
        let min = Infinity;
        let min_source;
        for (let s in sources) {
            let cur_source = sources[s];
            let source_creeps = _.filter(room_creeps, function(c) {
                if (c.memory.get_target) {
                    return c.memory.get_target.id == cur_source;                    
                } else {
                    return false;
                }
            });
            if (source_creeps.length < min) {
                min = source_creeps.length;
                min_source = cur_source;
            }
        }
        if (!min_source) {
            return false;
        }
        creep.memory.get_target = {id: min_source, type: TARGET_SOURCE };
        return true;        
    }

    const aggregate_container = function (container) {
        let energy = container.store.getUsedCapacity(RESOURCE_ENERGY);
        let floor_energy = container.pos.lookFor(LOOK_ENERGY);
        if (floor_energy.length > 0) {
            energy += floor_energy[0].amount;
        }
        return energy;
    }

    const set_get_target_container = function() {
        let room = Game.rooms[creep.memory.home_room];        
        let containers = room.find(FIND_STRUCTURES, 
            {filter: s => s.structureType == STRUCTURE_CONTAINER 
                && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0});
        let container;
        if (containers.length == 0) {
            return false;
        }
        container = _.max(containers, aggregate_container);
        creep.memory.get_target = {id: container.id, type: TARGET_CONTAINER};
        return true;
    }


    const set_get_target_dropped = function() {
        let room = Game.rooms[creep.memory.home_room];
        let dropped = room.find(FIND_DROPPED_RESOURCES, {
            filter: r => r.resourceType == RESOURCE_ENERGY 
                    && r.pos.lookFor(LOOK_STRUCTURES).length == 0
        });
        if (dropped.length > 0) {
            dropped.sort(r => r.amount);
            creep.memory.get_target = {id: dropped[0].id, type: TARGET_DROPPED};
            return true;
        }
        return false;
    }

    const set_get_target_tombstone = function() {
        let room = Game.rooms[creep.memory.home_room];
        let tombstones = room.find(FIND_TOMBSTONES, {
           filter: t => t.store.getUsedCapacity(RESOURCE_ENERGY) > 0
        });
        if (tombstones.length > 0) {
            tombstones.sort(r => r.store.getUsedCapacity(RESOURCE_ENERGY));
            creep.memory.get_target = {id: tombstones[0].id, type: TARGET_TOMB};
            return true;
        }
        return false;
    }

    const set_get_target = function() {
        return set_get_target_tombstone() || set_get_target_dropped() || set_get_target_container() || set_get_target_source();
    }

    const clear_get = function() {
        creep.memory.get_target = null;
    }

    const clear_task = function() {
        creep.memory.task = null;
        creep.memory.get_target = null;
        creep.memory.put_target = null;
        creep.memory.working = false;
    }

    const set_build_target = function(creep) {
        let room = Game.rooms[creep.memory.home_room];
        let targets = room.find(FIND_MY_CONSTRUCTION_SITES);
        if (targets.length == 0) {
            debug.logError("no construction sites", "set_build_target");
        }
        return creep.pos.findClosestByPath(targets);
    }

    const set_spawn_target = function(creep) {
        let room = Game.rooms[creep.memory.home_room];
        let targets = creep.room.find(FIND_STRUCTURES, 
            { filter: (s) => ((s.structureType == STRUCTURE_SPAWN 
                            || s.structureType == STRUCTURE_EXTENSION)
                            && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            });
        if (targets.length == 0) {
            return null;
            // TODO: Deal with this contingency
        }
        return creep.pos.findClosestByPath(targets);
    }

    const set_repair_target = function(creep) {
        let room = Game.rooms[creep.memory.home_room];        
        let targets = creep.room.find(FIND_STRUCTURES,
        {
            filter: s => (s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART ) && (s.hits < s.hitsMax)
        })
        if (targets.length == 0) {
            debug.logError("no damaged structures", "set_repair_target");
            return null;
        }
        targets.sort((a, b) => (a.hits/a.hitsMax) - (b.hits/b.hitsMax));
        return targets[0];        
    }


    const set_wallrepair_target = function(creep) {
        let room = Game.rooms[creep.memory.home_room];        
        let targets = creep.room.find(FIND_STRUCTURES,
        {
            filter: s => (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART ) && (s.hits < s.hitsMax)
        })
        if (targets.length == 0) {
            debug.logError("no damaged walls", "set_wallrepair_target");
            return null;
        }
        targets.sort((a, b) => (a.hits - b.hits));
        return targets[0];        
    }        

    const set_controller_target = function(creep) {
        return Game.rooms[creep.memory.home_room].controller;
    }

    
    const set_put_target = function() {
        let room = Game.rooms[creep.memory.home_room];
        let target = null;
        switch (creep.memory.task) {
            case TASK_BUILDER:
                target = set_build_target(creep);
                break;
            case TASK_SPAWNER:
                target = set_spawn_target(creep);
                break;
            case TASK_CONTROLLER:
                target = set_controller_target(creep);
                break;
            case TASK_REPAIR:
                target = set_repair_target(creep);
                break;
            case TASK_WALLREPAIR:
                target = set_wallrepair_target(creep);
            default:
                debug.logError("task not implemented", "set_put_target")
        }
        if (target != null) {
            creep.memory.put_target = target.id;            
        }
        if (target == null) {            
            debug.logError(`resetting task: ${creep.memory.task} for creep: ${creep.name}`);
            clear_task();
        }
    }

    function validate_get_target() {
        if (!creep.memory.get_target || !Game.getObjectById(creep.memory.get_target.id)) {
            set_get_target();
        }
        let target = Game.getObjectById(creep.memory.get_target.id);
        if (!target) {
            set_get_target();
            debug.logError("error target not found", "validate_get_target")
            return null;
        }
        let valid = true;
        switch(creep.memory.get_target.type) {
            case TARGET_SOURCE:
                break;
            case TARGET_CONTAINER:
                break;
            case TARGET_DROPPED:
                break;
            case TARGET_TOMB:
                valid = target.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
                break;
            default:
                debug.logError(`ERROR - Type not recognized: [${creep.memory.get_target.type}]`, "validate_get_target");
                break;
        }
        if (!valid) {
            set_get_target();
            return null;
        }
        return target;
    }

    function run_working() {
        if (!creep.memory.put_target) {
            set_put_target();
        }

        let target = Game.getObjectById(creep.memory.put_target);
        if (!target) {
            clear_task();
            return;
        }

        let retval;
        switch (creep.memory.task) {
            case TASK_CONTROLLER: // fallthrough
            case TASK_SPAWNER:
                retval = creep.transfer(target, RESOURCE_ENERGY);
                break;
            case TASK_BUILDER:
                retval = creep.build(target);
                break;
            case TASK_REPAIR: // fallthrought
            case TASK_WALLREPAIR:
                if (target.hits == target.hitsMax) {
                    set_put_target();
                    target = Game.getObjectById(creep.memory.put_target);
                }
                retval = creep.repair(target);
                break;
        }

        switch (retval) {
            case OK:
                break;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(target);
                break;
            case ERR_FULL:
                set_put_target();
                break;
            default:
                debug.logError(`Error [${retval}]`, "run_working");            

        }        
    }

    function run_get_energy() {
        let target = validate_get_target();
        if (!target) {
            debug.logError("no target", "run_get_energy");
        }
        if (target) {
            let target_type = creep.memory.get_target.type;
            let retval;
            switch(target_type) {
                case TARGET_TOMB:
                    retval = creep.withdraw(target, RESOURCE_ENERGY);
                    break;
                case TARGET_DROPPED:
                    retval = creep.pickup(target);
                    break;
                case TARGET_SOURCE:
                    retval = creep.harvest(target);
                    break;
                case TARGET_CONTAINER:
                    let ground_energy = target.pos.lookFor(LOOK_ENERGY).sort((a,b)=> b.amount - a.amount);
                    if (ground_energy.length > 0 && ground_energy[0].amount > 0) {
                        retval = creep.pickup(ground_energy[0]);
                    } else {
                        retval = creep.withdraw(target, RESOURCE_ENERGY);                        
                    }
                    break;
                default:
                    debug.logError(`Error [${target_type}] not found, creep ${creep.name}`, "run_get_energy");
            }
            switch (retval) {
                case OK:
                    break;
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(target);
                    break;
                case ERR_NOT_ENOUGH_RESOURCES:
                    debug.logError(`not enough resources at [${target}]`, creep.name);                
                    set_get_target();
                    break;
                default:
                    debug.logError(`Error [${retval}]`, "run_get_energy");
            }
        }
    }

    function init_memory() {
        if (creep.memory.home_room == undefined || creep.memory.home_room == "" ) {
            creep.memory.home_room = creep.room.name;
        }
    }

    function display_icons() {
        let saymoji = "";
        switch(creep.memory.working) {
            case true:
                saymoji += "🔋";
                break;
            case false:
                saymoji += "🗑";
        }
        switch(creep.memory.task) {
            case TASK_BUILDER:
                saymoji += "🔨";
                break;
            case TASK_CONTROLLER:
                saymoji += "🎮";
                break;
            case TASK_SPAWNER:
                saymoji += "🌱";
                break;
            case TASK_REPAIR:
                saymoji += "🔧";
                break;
            case TASK_WALLREPAIR:
                saymoji += "🧱";
                break;
            case undefined:
                saymoji += "❗";
                break;
            default:
                saymoji += "❓";
                break;
        }
        creep.say(saymoji);        
    }

    this.run = function() {
        init_memory();
        if (creep.spawning) {
            return;
        }
        set_working();
        if (creep.memory.working) {
            run_working();
        } else {
            run_get_energy();
        }
        display_icons();
    }    
}