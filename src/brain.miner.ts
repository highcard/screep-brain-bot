import {BehaviorMine} from "./behavior.mine";
import {BehaviorHaul} from "./behavior.haul";
import {BehaviorRepair} from "./behavior.repair";
import {BehaviorBuild} from "./behavior.build";


class BrainMiner {

    creep : Creep;

    constructor(creep : Creep) {
        this.creep = creep;
    }

    get_memory() : WorkerMemory {
        return this.creep.memory as MinerMemory;
    }

    set_working() {
        let memory = this.get_memory();
        if (memory.working == undefined) {
            memory.working = false;
        }
        if (!memory.working) {
            let target = Game.getObjectById(memory.target.haul);
            if (this.creep.pos.isEqualTo(target)){
                memory.working = true;
            }
        }
    }

    // consider logic here to have miner build and repair own container
    run() {
        this.set_working();
        let memory = this.get_memory();
        if (this.creep.memory.working) {
            let mining = new BehaviorMine(this.creep);
            mining.run();
            let hauling = new BehaviorHaul(this.creep);
            hauling.run();
        } else {
            this.creep.moveTo(Game.getObjectById(memory.target.haul));
        }
        this.creep.say("⛏");
    }
}

export { BrainMiner };