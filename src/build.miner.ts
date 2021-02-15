/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('build.miners');
 * mod.thing == 'a thing'; // true
 */
const Debugger = require("utils.debug");
const debug = new Debugger("build.miner");

const CreepBuilder = require("creep.factory");

module.exports = function(opts) {
    
    const room = opts.room;
    let role = "miner";
    opts.role = role;
    let body;
    let energy_min;    
    const creepBuilder = new CreepBuilder();

    this.cmd = opts.cmd;

    this.satisfied = function() {
        let buildNum = room.find(FIND_SOURCES).length;        
        let curRoleCreeps = _.filter(Game.creeps, function(c) {
            return c.memory.role == opts.role && c.memory.home_room == room.name
        });
        return curRoleCreeps.length >= buildNum;
    }
    
    this.prereq = function() {
        let energy = room.energyAvailable;
        let bodies = [
            [CARRY, WORK, WORK, WORK, WORK, MOVE, MOVE], // RCL 2
            [CARRY, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE], // RCL 3    
        ];
        for (let b in bodies) {
            let cur_energy = creepBuilder.calculate_creep_cost(bodies[b]);
            if (cur_energy <= room.energyCapacityAvailable) {
                body = bodies[b];
                energy_min = cur_energy;
                continue;
            }
            break;
        }
        return  energy >= energy_min;
    }
    
    this.run = function() {
        const sources = room.find(FIND_SOURCES);
        let spawner = room.find(FIND_MY_SPAWNS)[0];
        if (!spawner) {
            debug.logError("no spawner found");
            return -1;
        }
        let retval = spawner.spawnCreep(body, creepBuilder.generate_creep_name(opts), {
            memory: {
                role: opts.role,
                home_room: room.name,
                get_target: "",
                put_target: ""
            }
        });
        return retval;        
    }

};