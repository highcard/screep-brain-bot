import CreepFactory from "./creep.factory";
import * as _W from "./constants.worktarget";
import {BuildManager} from "./build.manager";

/// <reference path="./builorder.command" />

class ObjectiveBuildTest implements BuildCommand {

    cmd : string;
    role : string;
    room : Room;

    constructor(room : Room, cmd : string) {
        this.role = null;
        this.cmd = cmd;
        this.room = room;
    }

    satisfied() : boolean {
        return false;
    }
    
    prereq() : boolean {
        return true;
    }
    
    run() {
        let build_manager = new BuildManager(this.room);
        let flags = this.room.find(FIND_FLAGS);
        for (let f in flags) {

            let flag = flags[f];
            let variance = [-1, 1];
            build_manager.add_task(this.cmd, flag.pos, STRUCTURE_CONTAINER);
            for (let v in variance) {
                let pos;
                pos = new RoomPosition(flag.pos.x + variance[v], flag.pos.y, flag.pos.roomName);
                build_manager.add_task(this.cmd, pos, STRUCTURE_CONTAINER);
                pos = new RoomPosition(flag.pos.x, flag.pos.y + variance[v], flag.pos.roomName);
                build_manager.add_task(this.cmd, pos, STRUCTURE_CONTAINER);
            }
        }
        build_manager.run();
    }

};


 export {ObjectiveBuildTest};