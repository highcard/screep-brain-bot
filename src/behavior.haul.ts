/// <reference path="./creepmemory.worker.ts" />

interface HaulMemory extends WorkerMemory {
    target: {
        haul: Id<ContainerTarget>;
    };
}

const get_memory = function(creep : Creep) : HaulMemory {
    return creep.memory as HaulMemory;
}

const get_target = function(creep : Creep) : ContainerTarget {
    let memory = get_memory(creep);
    let target = Game.getObjectById(memory.target.haul);
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