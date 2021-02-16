import {CreepBehavior} from "./abstract.behavior";

class BehaviorUpgrade extends CreepBehavior {
    
    creep : Creep;

    constructor(creep: Creep) {
        super(creep);
    }

    get_memory() : UpgradeMemory {
        return this.creep.memory as UpgradeMemory;
    }

    get_target() : StructureController {
        let memory = this.get_memory();
        let target = Game.getObjectById(memory.target.upgrade);
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

export {BehaviorUpgrade};