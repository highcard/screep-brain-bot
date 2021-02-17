const get_memory = function(creep : Creep) : WithdrawMemory {
    return creep.memory as WithdrawMemory;
}

const get_target = function(creep : Creep) : ContainerTarget {
    let memory = get_memory(creep);
    let target = Game.getObjectById(memory.target.withdraw);
    if (!target) {
        return null;
    }
    return target;
}

const run = function(creep : Creep) : boolean {
    let target = get_target(creep);
    let success = false;
    if (!target) {
        return success;
    }
    let ground_energy = target.pos.lookFor(LOOK_ENERGY).sort((a,b)=> b.amount - a.amount);
    let retval;
    if (ground_energy.length > 0 && ground_energy[0].amount > 0) {
        retval = creep.pickup(ground_energy[0]);
    } else {
        retval = creep.withdraw(target, RESOURCE_ENERGY);                        
    }
    switch (retval) {
        case OK:
            success = true;
            break;
        case ERR_NOT_IN_RANGE:
            creep.moveTo(target);
            success = true;
            break;
        default:
            break;
    }
    return success;
}

export {run};