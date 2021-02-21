import * as BehaviorHaul from "./behavior.haul";
import * as BehaviorWithdraw from "./behavior.withdraw";
import * as BehaviorFill from "./behavior.fill";

declare interface HaulerMemory extends WorkerMemory {
    target: {
        withdraw: Id<ContainerTarget>;
        haul: Id<ContainerTarget>;
        fill: Id<FillTarget>;
    }
}

class BrainHauler {

    creep : Creep;

    constructor(creep : Creep) {
        this.creep = creep;
    }

    get_memory() : WorkerMemory {
        return this.creep.memory as HaulerMemory;
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

    // consider logic here to have miner build and repair own container
    run() {
        this.set_working();
        let memory = this.get_memory();
        if (this.creep.memory.working) {
            BehaviorFill.run(this.creep) || BehaviorHaul.run(this.creep);
        } else {
            BehaviorWithdraw.run(this.creep);
        }
        this.creep.say("🚚");
    }
}

export { BrainHauler };