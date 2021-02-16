import {CreepBehavior} from "./abstract.behavior";

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
            case TASK_BUILDER:
                saymoji += "🔨";
                break;
            case TASK_CONTROLLER:
                saymoji += "🎮";
                break;
            case TASK_SPAWNER:
                saymoji += "🌱";
                break;
            case TASK_REPAIR:
                saymoji += "🔧";
                break;
            case TASK_WALLREPAIR:
                saymoji += "🧱";
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
                case TASK_BUILDER:
                    behavior = new BehaviorBuild(this.creep);
                    break;
                case TASK_CONTROLLER:
                    behavior = new BehaviorUpgrade(this.creep);
                    break;
                case TASK_SPAWNER:
                    behavior = new BehaviorFill(this.creep);
                    break;
                case TASK_WALLREPAIR:
                    behavior = new BehaviorRepair(this.creep);
                    break;
                case TASK_WALLREPAIR:
                    behavior = new BehaviorWallrepair(this.creep);
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