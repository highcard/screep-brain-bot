import * as BehaviorHarvest from "./behavior.harvest";
import * as BehaviorHaul from "./behavior.haul";
import * as BehaviorRepair from "./behavior.repair";
import * as BehaviorBuild from "./behavior.build";

declare interface MinerMemory extends WorkerMemory {
    target: {
        harvest: Id<Source>;
        build: Id<ConstructionSite>;
        repair: Id<RepairTarget>;
        haul: Id<ContainerTarget>;
    }
}

class BrainMiner {

    creep : Creep;

    constructor(creep : Creep) {
        this.creep = creep;
    }

    get_memory() : WorkerMemory {
        return this.creep.memory as MinerMemory;
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
            BehaviorBuild.run(this.creep) || BehaviorRepair.run(this.creep) || BehaviorHaul.run(this.creep);
        } else {
            BehaviorHarvest.run(this.creep);
        }
        this.creep.say("⛏");
    }
}

export { BrainMiner };