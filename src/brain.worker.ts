import * as _W from "./constants.worktarget";

import * as BehaviorWithdraw from "./behavior.withdraw";
import * as BehaviorUpgrade from "./behavior.upgrade";
import * as BehaviorFill from "./behavior.fill";
import * as BehaviorBuild from "./behavior.build";
import * as BehaviorHaul from "./behavior.haul";
import * as BehaviorHarvest from "./behavior.harvest";
import * as BehaviorRepair from "./behavior.repair";
import * as BehaviorWallrepair from "./behavior.wallrepair";

class BrainWorker {

    creep : Creep;

    constructor(creep : Creep) {
        this.creep = creep;
        this.mem_init();
    }

    mem_init() {
        console.log("brainw.worker mem_init() start");
        let mem = this.creep.memory;
        let default_mem = _W.default_workermemory;
        let entries = Object.entries(default_mem);
        for (let property in entries) {
            let key = entries[property][0];
            let value = entries[property][1]
            mem[key] = mem[key] != undefined ? mem[key] : value;
        }
        mem.home_room = mem.home_room != undefined ? mem.home_room : this.creep.room.name;
        mem.role = mem.role != undefined ? mem.role : "worker";
        console.log("brainw.worker mem_init() end");
    }

    get_memory() : WorkerMemory {
        return this.creep.memory as WorkerMemory;
    }

    // All Workers
    set_working() {
        if (this.creep.memory.working == undefined) {
            this.creep.memory.working = true;
        }
        if (this.creep.memory.working) {
            if (this.creep.carry[RESOURCE_ENERGY] == 0) {
                this.creep.memory.working = false;
            }
        } else {
            if (this.creep.carry[RESOURCE_ENERGY] == this.creep.carryCapacity) {
                this.creep.memory.working = true;
            }
        }
    }

    clear_task() {
        let memory = this.get_memory();
        memory.idle = true;
        memory.target = {};
        memory.working = false;
    }

    init_memory() {
        if (this.creep.memory.home_room == undefined || this.creep.memory.home_room == "" ) {
            this.creep.memory.home_room = this.creep.room.name;
        }
    }

    display_icons() {
        let saymoji = "";
        let memory = this.get_memory();
        switch(memory.working) {
            case true:
                saymoji += "🔋";
                break;
            case false:
                saymoji += "🗑";
        }
        switch(memory.task.type) {
            case _W.PUTTARGET_BUILD:
                saymoji += "🔨";
                break;
            case _W.PUTTARGET_UPGRADE:
                saymoji += "🎮";
                break;
            case _W.PUTTARGET_FILL:
                saymoji += "🌱";
                break;
            case _W.PUTTARGET_REPAIR:
                saymoji += "🔧";
                break;
            case _W.PUTTARGET_WALLREPAIR:
                saymoji += "🧱";
                break;
            case _W.PUTTARGET_CONTAINER:
                saymoji += "🚚";
                break;
            case undefined:
                saymoji += "❗";
                break;
            default:
                saymoji += "❓";
                break;
        this.creep.say(saymoji);
        }
    }

    run() {
        this.init_memory();
        if (this.creep.spawning) {
            return;
        }
        this.set_working();
        let memory = this.get_memory();
        if (memory.working) {
            BehaviorUpgrade.run(this.creep) ||
            BehaviorFill.run(this.creep) ||
            BehaviorBuild.run(this.creep) ||
            BehaviorHaul.run(this.creep) ||
            BehaviorRepair.run(this.creep) ||
            BehaviorWallrepair.run(this.creep);
        } else {
            if (!(BehaviorWithdraw.run(this.creep) || BehaviorHarvest.run(this.creep))) {
                console.log("creep starved");
            }
        }
        this.display_icons();
    }
}

export {BrainWorker}