import {CreepBehavior} from "./abstract.behavior";

class BehaviorWithdraw extends CreepBehavior {

    creep : Creep;

    constructor(creep : Creep) {
        super(creep);
    }

    get_memory() : WithdrawMemory {
        return this.creep.memory as WithdrawMemory;
    }

    get_target() : ContainerTarget {
        let memory = this.get_memory();
        let target = Game.getObjectById(memory.target.withdraw);
        if (!target) {
            return null;
        }
        return target;
    }

    run() : boolean {
        let target = this.get_target();
        let success = false;
        if (!target) {
            return success;
        }
        let ground_energy = target.pos.lookFor(LOOK_ENERGY).sort((a,b)=> b.amount - a.amount);
        let retval;
        if (ground_energy.length > 0 && ground_energy[0].amount > 0) {
            retval = this.creep.pickup(ground_energy[0]);
        } else {
            retval = this.creep.withdraw(target, RESOURCE_ENERGY);                        
        }
        switch (retval) {
            case OK:
                success = true;
                break;
            case ERR_NOT_IN_RANGE:
                this.creep.moveTo(target);
                success = true;
                break;
            default:
                break;
        }
        return success;
    }

}

export {BehaviorWithdraw};