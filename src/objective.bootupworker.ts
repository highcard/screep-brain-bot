import CreepFactory from "./creep.factory";
import * as _W from "./constants.worktarget";

/// <reference path="./builorder.command" />
/// <reference path="./room.memory" />

function set_initial_memory(room) : WorkerMemory {
    let memory = _W.default_workermemory;
    memory.role = "worker";
    memory.home_room = room.name;
    memory.task.id = "bootupworker";
    memory.idle = false;
    memory.task.type = _W.PUTTARGET_FILL;
    let source = _.max(room.memory.sources, (s : SourceEntry) => s.spots.length);
    memory.target.harvest = room.memory.source.id;
    memory.target.fill = room.find(FIND_MY_SPAWNS)[0].id; // considering optimizing
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
        return  room.energyAvailable >= 300;
    },


    run : function(room : Room, cmd : CommandOptions) {
        let memory = set_initial_memory(room);
        CreepFactory.build_creep(
            room,
            "worker",
            room.energyAvailable,
            memory
        );
    }
}

export {ObjectiveBootup};