import {CreepBehavior} from "./abstract.behavior";

class BehaviorWallrepair extends CreepBehavior {
    
    creep : Creep;

    constructor(creep: Creep) {
        super(creep);
    }

    get_memory() : WallRepairMemory {
        return this.creep.memory as WallRepairMemory;
    }

    get_target() : WallRepairTarget {
        let memory = this.get_memory();
        let target = Game.getObjectById(memory.target.wallrepair);
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
        switch(this.creep.repair(target)) {
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
export {BehaviorWallrepair};