import {CreepBehavior} from "./abstract.behavior";

class BehaviorRepair extends CreepBehavior {
    
    creep : Creep;

    constructor(creep: Creep) {
        super(creep);
    }

    get_target() : RepairTarget {
        let memory = this.get_memory();
        let target = Game.getObjectById(memory.target.repair);
        if (!target) {
            return null;
        }
        return target;
    }

    get_memory() : RepairMemory {
        return this.creep.memory as RepairMemory;
    }

    // figure out when to call this.
    set_repair_target() {
        let memory = this.get_memory();
        let room = Game.rooms[this.creep.memory.home_room];
        let targets = this.creep.room.find(FIND_STRUCTURES, 
            { filter: (s) => ((s.structureType == STRUCTURE_SPAWN 
                            || s.structureType == STRUCTURE_EXTENSION)
                            && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            });
        if (targets.length == 0) {
            return null;
            // TODO: Deal with this contingency
        }
        memory.target.repair = this.creep.pos.findClosestByPath(targets).id;
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

export {BehaviorRepair};