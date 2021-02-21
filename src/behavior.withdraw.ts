/// <reference path="./creepmemory.worker.ts" />

interface WithdrawMemory extends WorkerMemory {
    target: {
        withdraw: Id<ContainerTarget>;
    }
}

const isWithdrawMemory = function(x : CreepMemory): x is WithdrawMemory {
    return (x as CreepMemory).target !== undefined
        && (x as CreepMemory).target.withdraw !== undefined
        && (x as CreepMemory).idle !== undefined
        && (x as CreepMemory).working !== undefined
        && (x as CreepMemory).role !== undefined
        && (x as CreepMemory).home_room !== undefined;
}


const get_target = function(creep : Creep) : ContainerTarget {
    let memory = creep.memory;
    if (isWithdrawMemory(memory)) {
        let target = Game.getObjectById(memory.target.withdraw);
        if (!target) {
            return null;
        }
        return target;
    }
    return null;
}

const run = function(creep : Creep) : boolean {
    let target = get_target(creep);
    if (!target) {
        return false;
    }
    console.log("hit withdraw");
    let ground_energy = target.pos.lookFor(LOOK_ENERGY).sort((a,b)=> b.amount - a.amount);
    let retval;
    if (ground_energy.length > 0 && ground_energy[0].amount > 0) {
        retval = creep.pickup(ground_energy[0]);
    } else {
        retval = creep.withdraw(target, RESOURCE_ENERGY);                        
    }
    switch (retval) {
        case OK:
            break;
        case ERR_NOT_IN_RANGE:
            creep.moveTo(target);
            break;
        default:
            break;
    }
    return true;
}

export {run, isWithdrawMemory};