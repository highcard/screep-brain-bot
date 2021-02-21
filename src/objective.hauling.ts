import CreepFactory from "./creep.factory";
import * as _W from "./constants.worktarget";

/// <reference path="./builorder.command" />

class ObjectiveHauling implements BuildCommand {

    cmd : string;
    role : string;
    room : Room;

    constructor(room : Room, cmd : string) {
        this.role = "hauler";
        this.cmd = cmd;
        this.room = room;
    }

    satisfied() : boolean {
        let buildNum = this.room.find(FIND_SOURCES).length;        
        let curRoleCreeps = _.filter(Game.creeps, function(c) {
            return c.memory.role == this.role && c.memory.home_room == this.room.name
        });
        return curRoleCreeps.length >= buildNum;
    }
    
    prereq() : boolean {
        let energy = this.room.energyAvailable;
        let energy_min = Math.min(this.room.energyCapacityAvailable, 800);
        return energy >= energy_min;
    }
    
    run() {
        CreepFactory.build_creep(
            this.room,
            this.role,
            this.room.energyAvailable,
            _W.default_workermemory
        );
    }

    private set_targets() {
        let target = {};
    }

    private set_initial_memory() {
        let memory = _W.default_workermemory;
        memory.role = "hauler";
        memory.home_room = this.room.name;
        memory.task.id = this.cmd;
        memory.target.withdraw = null;
        return memory;
    }

};

export {ObjectiveHauling};