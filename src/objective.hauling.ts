import CreepFactory from "./creep.factory";
import * as _W from "./constants.worktarget";

/// <reference path="./builorder.command" />

const ObjectiveHauling : BuildCommand = {

    satisfied : function(room : Room, cmd: CommandOptions) : boolean {
        let buildNum = this.room.find(FIND_SOURCES).length;        
        let curRoleCreeps = _.filter(Game.creeps, function(c) {
            return c.memory.role == this.role && c.memory.home_room == this.room.name
        });
        return curRoleCreeps.length >= buildNum;
    },
    
    prereq : function(room : Room, cmd: CommandOptions) : boolean {
        let energy = this.room.energyAvailable;
        let energy_min = Math.min(this.room.energyCapacityAvailable, 800);
        return energy >= energy_min;
    },
    
    run : function(room : Room, cmd: CommandOptions) {
        CreepFactory.build_creep(
            room,
            "hauler",
            room.energyAvailable,
            _W.default_workermemory
        );
    },

};

export {ObjectiveHauling};