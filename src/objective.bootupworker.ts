import CreepFactory from "./creep.factory";
import * as _W from "./constants.worktarget";

/// <reference path="./builorder.command" />

function set_initial_memory() : WorkerMemory {
    let memory = _W.default_workermemory;
    memory.role = "worker";
    memory.home_room = this.room.name;
    memory.task.id = this.cmd;
    memory.idle = false;
    memory.task.type = _W.PUTTARGET_FILL;
    memory.target.harvest = this.room.memory.sources[0]; // considering optimizing
    memory.target.fill = this.room.find(FIND_MY_SPAWNS)[0].id; // considering optimizing
    return memory;
}

const ObjectiveBootup : BuildCommand = {

    satisfied : function(room : Room, cmd : CommandOptions) : boolean {
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
        return curRoleCreeps.length > 0;
    },

    prereq : function(room : Room, cmd : CommandOptions) : boolean {
        return  this.room.energyAvailable >= 300;
    },


    run : function(room : Room, cmd : CommandOptions) {
        let memory = this.set_initial_memory();
        CreepFactory.build_creep(
            this.room,
            this.role,
            this.room.energyAvailable,
            memory
        );
    }
}

export {ObjectiveBootup};