import {CreepBehavior} from "./abstract.behavior";

class BehaviorFill extends CreepBehavior {
    
    creep : Creep;

    constructor(creep: Creep) {
        super(creep);
    }

    get_memory() : FillMemory {
        return this.creep.memory as FillMemory;
    }

    get_target() : FillTarget {
        let memory = this.get_memory();
        let target = Game.getObjectById(memory.target.fill);
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
        switch(this.creep.transfer(target, RESOURCE_ENERGY)) {
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

export {BehaviorFill};