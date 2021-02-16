import {CreepBehavior} from "./abstract.behavior";

class BehaviorBuild extends CreepBehavior {
    
    creep : Creep;

    constructor(creep: Creep) {
        super(creep);
    }

    get_memory() : BuildMemory {
        return this.creep.memory as BuildMemory;
    }

    get_target() : ConstructionSite {
        let memory = this.get_memory();
        let target = Game.getObjectById(memory.target.build);
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
        switch(this.creep.build(target)) {
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

export {BehaviorBuild}