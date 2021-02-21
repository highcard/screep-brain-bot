import CreepFactory from "./creep.factory";
import * as _W from "./constants.worktarget";

/// <reference path="./builorder.command" />


const ObjectiveUpgradeContainer = {
    satisfied : function(room : Room, cmd : CommandOptions) : boolean {
        return true;
    },

    prereq : function(room : Room, cmd : CommandOptions) : boolean {
        return true;
    },

    run : function(room : Room, cmd : CommandOptions) {
        console.log("running ObjectiveUpgradeContainer");
    }

};

export {ObjectiveUpgradeContainer};