import CreepFactory from "./creep.factory";
import * as _W from "./constants.worktarget";

/// <reference path="./builorder.command" />


const ObjectiveUpgradeContainer : BuildCommand = {
    satisfied : function(room : Room, cmd : CommandOptions) : boolean {
        console.log("ObjectiveUpgradeContainer satisfied");
        return true;
    },

    prereq : function(room : Room, cmd : CommandOptions) : boolean {
        console.log("ObjectiveUpgradeContainer prereq");
        return true;
    },

    run : function(room : Room, cmd : CommandOptions) {
        console.log("running ObjectiveUpgradeContainer");
    }

};

export {ObjectiveUpgradeContainer};