import CreepFactory from "./creep.factory";
import * as _W from "./constants.worktarget";

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
        console.log("build.bootupworker begin satisfied()");
        let room = this.room;
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
        console.log("build.bootupworker end satisfied()");
    }

    prereq() : boolean {
        return  this.room.energyAvailable >= 300;
    }

    run() {
        let memory = this.set_initial_memory();
        CreepFactory.build_creep(
            this.room,
            this.role,
            this.room.energyAvailable,
            memory
        );
    }

    private set_initial_memory() {
        let memory = _W.default_workermemory;
        memory.role = "worker";
        memory.home_room = this.room.name;
        memory.task.id = this.cmd;
        memory.task.type = _W.PUTTARGET_FILL;
        memory.target.mine = this.room.memory.sources[0], // considering optimizing
        memory.target.fill = this.room.find(FIND_MY_SPAWNS)[0].id // figure out how to get specific spawn id
        return memory;
    }

}

export {BO_BootupWorker};