const get_memory = function(creep : Creep) : FillMemory {
    return creep.memory as FillMemory;
}

const get_target = function(creep : Creep) : FillTarget {
    let memory = get_memory(creep);
    let target = Game.getObjectById(memory.target.fill);
    if (!target) {
        return null;
    }
    return target;
}

const run = function(creep : Creep) : boolean {
    let target = get_target(creep);
    if (!target) {
        return false;
    }
    switch(creep.transfer(target, RESOURCE_ENERGY)) {
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
    
export {run};