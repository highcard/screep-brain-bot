/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('build.first_bootup');
 * mod.thing == 'a thing'; // true
 */

const Debugger = require("utils.debug");
const debug = new Debugger("build.bootupworker");

const CreepBuilder = require("creep.factory");

module.exports = function(opts){
    let creepbuilder = new CreepBuilder();
    let room = opts.room;
    let role = "worker";

    this.cmd = opts.cmd;

    this.satisfied = function() {
        // Returns true if there's at least one general-purpose worker creep, false otherwise
        let curRoleCreeps = _.filter(Game.creeps, function(c) {
            if (c.memory.home_room != room.name) {
                return false;
            } else {
                let work = false;
                let move = false;
                let carry = false;
                for (let b in c.body) {
                    switch(c.body[b].type) {
                        case WORK:
                            work = true;
                            break;
                        case MOVE:
                            move = true;
                            break;
                        case CARRY:
                            carry = true;
                            break;
                        default:
                            break;
                    }
                }
                return work && move && carry;
            }
        });
        debug.log(curRoleCreeps);
        return curRoleCreeps.length > 0;
    }

    this.prereq = function() {
        return  room.energyAvailable >= 300;
    }

    this.run = function() {
        let retval = creepbuilder.build_creep({
            room: room,
            role: role,
            energy: room.energyAvailable,
            memory: {
                get_target: null,
                set_target: null,
                task: null,
                idle: true
            }
        })
        debug.log(retval, "run");

    }
    return this;
}