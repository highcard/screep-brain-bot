import {CreepBehavior} from "./abstract.behavior";

class BehaviorMine extends CreepBehavior {
    
    creep : Creep;

    constructor(creep: Creep) {
        super(creep);
    }

    get_memory() : MinerMemory {
        return this.creep.memory as MinerMemory;
    }

    get_target() : Source {
        let memory = this.get_memory();
        let target = Game.getObjectById(memory.target.mine);
        if (!target) {
            return null;
        }
        return target;
    }

    run() : boolean {
        let target = this.get_target();
        if (!target) {
            return false;
        }
        switch(this.creep.harvest(target)) {
            case OK:
                break;
            case ERR_NOT_IN_RANGE:
                this.creep.moveTo(target);
                break;
            default:
                break;
        }
        return true;
    }    

}

export {BehaviorMine};