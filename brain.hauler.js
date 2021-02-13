/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.worker');
 * mod.thing == 'a thing'; // true
 */
const Debugger = require("utils.debug");
const debug = new Debugger("role.hauler");

module.exports = function(creep) {

    const TASK_SPAWNER = "spawner";

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

    const aggregate_container = function (container) {
        let energy = container.store.getUsedCapacity(RESOURCE_ENERGY);
        let floor_energy = container.pos.lookFor(LOOK_ENERGY);
        if (floor_energy.length > 0) {
            energy += floor_energy[0].amount;
        }
        return energy;
    }

    const set_get_target_minecontainer = function() {
        let room = Game.rooms[creep.memory.home_room];        
        let minecontainers = room.find(FIND_STRUCTURES, 
            {filter: s => s.structureType == STRUCTURE_CONTAINER 
                && s.pos.findInRange(FIND_SOURCES, 1) > 0
                && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0});
        let container;
        if (minecontainers.length == 0) {
            return false;
        }
        container = _.max(minecontainers, aggregate_container);
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
        debug.logInfo(tombstones, "set_get_target_tombstone");
        if (tombstones.length > 0) {
            tombstones.sort(r => r.store.getUsedCapacity(RESOURCE_ENERGY));
            creep.memory.get_target = {id: tombstones[0].id, type: TARGET_TOMB};
            return true;
        }
        return false;
    }

    const set_get_target = function() {
        return set_get_target_tombstone() || set_get_target_dropped() || set_get_target_minecontainer();
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
            debug.log("no construction sites", "set_build_target");
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

    
    const set_put_target = function() {
        let room = Game.rooms[creep.memory.home_room];
        let target = null;
        switch (creep.memory.task) {
            case TASK_CONTROLLER:
                target = set_controller_target(creep);
                break;
            default:
                debug.log("task not implemented", "set_put_target")
        }
        if (target != null) {
            creep.memory.put_target = target.id;            
        }
        if (target == null) {            
            debug.log(`resetting task: ${creep.memory.task} for creep: ${creep.name}`);
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
            debug.log("error target not found", "validate_get_target")
            return null;
        }
        let valid = true;
        switch(creep.memory.get_target.type) {
            case TARGET_CONTAINER:
                break;
            case TARGET_DROPPED:
                break;
            case TARGET_TOMB:
                valid = target.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
                break;
            default:
                debug.log(`ERROR - Type not recognized: [${creep.memory.get_target.type}]`, "validate_get_target");
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

        switch (creep.memory.task) {
            case TASK_SPAWNER:
                retval = creep.transfer(target, RESOURCE_ENERGY);
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
                debug.log(`Error [${retval}]`, "run_working");            

        }        
    }

    function run_get_energy() {
        let target = validate_get_target();
        if (!target) {
            debug.log("no target", "run_get_energy");
        }
        if (target) {
            let target_type = creep.memory.get_target.type;
            switch(target_type) {
                case TARGET_TOMB:
                    retval = creep.withdraw(target, RESOURCE_ENERGY);
                    break;
                case TARGET_DROPPED:
                    retval = creep.pickup(target);
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
                    debug.log(`Error [${target_type}] not found, creep ${creep.name}`, "run_get_energy");
            }
            switch (retval) {
                case OK:
                    break;
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(target);
                    break;
                case ERR_NOT_ENOUGH_RESOURCES:
                    debug.log(`not enough resources at [${target}]`, creep.name);                
                    set_get_target();
                    break;
                default:
                    debug.log(`Error [${retval}]`, "run_get_energy");
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
            case TASK_SPAWNER:
                saymoji += "🌱";
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