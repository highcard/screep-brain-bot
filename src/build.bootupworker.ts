/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('build.first_bootup');
 * mod.thing == 'a thing'; // true
 */

import CreepFactory from "./creep.factory";

class BO_BootupWorker implements BuildCommand {

    cmd : string;
    role : string;
    room : Room;

    constructor(room : Room, cmd : string) {
        this.role = "worker";
        this.cmd = cmd;
        this.room = room;
    }

    satisfied() : boolean {
        // Returns true if there's at least one general-purpose worker creep, false otherwise
        let curRoleCreeps = _.filter(Game.creeps, function(c) {
            if (c.memory.home_room != this.room.name) {
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
        return curRoleCreeps.length > 0;
    }

    prereq() : boolean {
        return  this.room.energyAvailable >= 300;
    }

    run() {
        let memory = {
            get_target: null,
            put_target: null,
            task: null,
            idle: true
        }
        CreepFactory.build_creep(
            this.room,
            this.role,
            this.room.energyAvailable,
            memory
        );
    }
}

export {BO_BootupWorker};