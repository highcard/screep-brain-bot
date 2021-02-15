/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('build.first_bootup');
 * mod.thing == 'a thing'; // true
 */

const Debugger = require("utils.debug");
const debug = new Debugger("build.bootup");

const CreepBuilder = require("creep.factory");

module.exports = function(opts){
    let buildNum = opts.num;
    let creepbuilder = new CreepBuilder();
    let room = opts.room;
    let role = "worker";
    this.cmd = opts.cmd;
    let queue = new BuildQueue(room);

    this.satisfied = function() {
        let curRoleCreeps = _.filter(Game.creeps, function(c) {
            return c.memory.role == role && c.memory.home_room == room.name
        });
        return curRoleCreeps.length >= buildNum;
    }

    this.prereq = function() {
        let energy = room.energyAvailable;
        return  energy >= 300;
    }

    this.run = function() {
        let spawner = room.find(FIND_MY_SPAWNS)[0];
        if (!spawner) {
            debug.logError("no spawner found");
            return -1;
        }
        let retval = spawner.spawnCreep([WORK, CARRY, CARRY, MOVE, MOVE], creepbuilder.generate_creep_name(opts), {
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