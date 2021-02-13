/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('build.first_bootup');
 * mod.thing == 'a thing'; // true
 */
const Debugger = require("utils.debug");
const debug = new Debugger("build.worker");

const CreepBuilder = require("utils.creepbuilder");

module.exports = function(opts){
    let buildNum = opts.num;
    let creepBuilder = new CreepBuilder();
    let room = opts.room;
    let role = "worker";
    let body;
    let energy_min;

    this.cmd = opts.cmd;
    
    this.satisfied = function() {
        let curRoleCreeps = _.filter(Game.creeps, function(c) {
            return c.memory.role == role && c.memory.home_room == room.name
        });
        return curRoleCreeps.length >= buildNum;
    }

    this.prereq = function() {
        let energy = room.energyAvailable;
        let bodies = [
            [WORK, CARRY, CARRY, MOVE, MOVE], // RCL 1
            [MOVE,MOVE,MOVE,WORK,WORK,CARRY,CARRY,CARRY,CARRY], // RCL 2    
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
        let spawner = room.find(FIND_MY_SPAWNS)[0];
        if (!spawner) {
            debug.logError("no spawner found");
            return -1;
        }
        let retval = spawner.spawnCreep(body, creepBuilder.generate_creep_name(opts), {
            memory: {
                role: role,
                home_room: spawner.room.name,
                get_target: "",
                put_target: ""
            }
        });
        return retval;
    }
    return this;
}