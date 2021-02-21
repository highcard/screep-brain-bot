import CreepFactory from "./creep.factory";
import * as _W from "./constants.worktarget";

/// <reference path="./builorder.command" />

class ObjectiveSpawnFiller implements BuildCommand {

    cmd : string;
    role : string;
    room : Room;

    constructor(room : Room, cmd : string) {
        this.role = "hauler";
        this.cmd = cmd;
        this.room = room;
    }

    satisfied() : boolean {
        // Returns true if there's at least one general-purpose worker creep, false otherwise
        let room = this.room;
        let curRoleCreeps = _.filter(Game.creeps, function(c) {
            c.memory.home_room == this.room.name && c.memory.role == this.role;
        });
        return (curRoleCreeps.length > 0);
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
        memory.role = "hauler";
        memory.home_room = this.room.name;
        memory.task.id = this.cmd;
        memory.idle = false;
        memory.task.type = _W.PUTTARGET_FILL;
        return memory;
    }

}

export {ObjectiveSpawnFiller};