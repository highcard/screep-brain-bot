import {CreepBehavior} from "./abstract.behavior";
import * as _W from "./constants.worktarget";

import {BehaviorWithdraw} from "./behavior.withdraw";
import {BehaviorUpgrade} from "./behavior.upgrade";
import {BehaviorFill} from "./behavior.fill";
import {BehaviorBuild} from "./behavior.build";
import {BehaviorHaul} from "./behavior.haul";
import {BehaviorMine} from "./behavior.mine";
import {BehaviorRepair} from "./behavior.repair";
import {BehaviorWallrepair} from "./behavior.wallrepair";

class BrainWorker {

    creep : Creep;

    constructor(creep : Creep) {
        this.creep = creep;
        this.mem_init();
    }

    mem_init() {
        let mem = this.creep.memory;
        mem.role = mem.role != undefined ? mem.role : "worker";
        mem.home_room = mem.home_room != undefined ? mem.home_room : this.creep.room.name;
        mem.working = mem.working != undefined ? mem.working : false;
        mem.idle = mem.idle != undefined ? mem.idle : true;
        mem.task = mem.task != undefined ? mem.task : {type: null, id: null};
        mem.target = mem.target != undefined ? mem.target : {
            mine: null,
            build: null,
            upgrade: null,
            fill: null,
            repair: null,
            wallrepair: null,
            withdraw: null,
            haul: null
        };
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
            let behavior : CreepBehavior;
            switch(memory.task.type) {
                case _W.PUTTARGET_BUILD:
                    behavior = new BehaviorBuild(this.creep);
                    break;
                case _W.PUTTARGET_UPGRADE:
                    behavior = new BehaviorUpgrade(this.creep);
                    break;
                case _W.PUTTARGET_FILL:
                    behavior = new BehaviorFill(this.creep);
                    break;
                case _W.PUTTARGET_REPAIR:
                    behavior = new BehaviorRepair(this.creep);
                    break;
                case _W.PUTTARGET_WALLREPAIR:
                    behavior = new BehaviorWallrepair(this.creep);
                    break;
                case _W.PUTTARGET_CONTAINER:
                    behavior = new BehaviorHaul(this.creep);
                    break;
                default:
                    break;
            }
            if (behavior) {
                behavior.run();
            }
        } else {
            let can_wthdraw = new BehaviorWithdraw(this.creep).run();
            if (!can_wthdraw) {
                new BehaviorMine(this.creep).run();
            }
        }
        this.display_icons();
    }    
}

export {BrainWorker}