/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('build.miners');
 * mod.thing == 'a thing'; // true
 */


const CreepBuilder = require("utils.creepbuilder");


 // UNUSED. NOT NEEDED (YET)
module.exports = function(opts) {

    const memkey = "ReplaceCreep";
    const creepBuilder = new CreepBuilder();
    const room = opts.room;

    if (Memory.BuildOrder == undefined || Memory.BuildOrder == null) {
        Memory.BuildOrder = {};
    }
    if (Memory.BuildOrder[room.name]  == undefined || Memory.BuildOrder[room.name] == null) {
        Memory.BuildOrder[room.name] = {};
    }
    if (Memory.BuildOrder[room.name][memkey] == undefined || Memory.BuildOrder[room.name][memkey] == null) {
        Memory.BuildOrder[room.name][memkey] = [];
    }

    let body;
    let energy_min;
    let energy = room.energyAvailable;    
    
    this.cmd = opts.cmd;

    this.satisfied = function() {
        return Memory.BuildOrder[room.name][memkey].length == 0;
    }
    
    this.prereq = function() {
        let next = Memory.BuildOrder[room.name][memkey][0];
        switch (room.controller.level) {
            case 0:
            case 1:
                console.log("DANGER, WILL ROBINSON");
                break;
            case 2:
                body = [CARRY, WORK, WORK, WORK, WORK, MOVE, MOVE];
                break;
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
                body = [CARRY, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE];
                break;
        }
        energy_min = creepBuilder.calculate_creep_cost(body);        
        return energy >= energy_min; // DEADLOCK POSSIBLE HERE RE:EXTENSIONS IF LEVELED UP SINCE REGISTERING. DANGER, WILL ROBINSON
    }
    
    this.run = function() {        
        let spawner = room.find(FIND_MY_SPAWNS)[0];
        let next = Memory.BuildOrder[room.name][memkey].shift();
        if (!spawner) {
            console.log("no spawner found");
            return -1;
        }
        let retval = spawner.spawnCreep(body, {room: room, role: next.role}, {
            memory: {
                role: next.role,
                home_room: next.home_room,
                get_target: next.get_target,
                put_target: next.put_target
            }
        });
        return retval;        
    }
};