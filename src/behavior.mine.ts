/// <reference path="./creepmemory.worker.ts" />

interface HarvestMemory extends WorkerMemory {
    target: {
        mine: Id<Source>;
    }
}

const get_memory = function(creep : Creep) : HarvestMemory {
    return creep.memory as HarvestMemory;
}

const get_target = function(creep : Creep) : Source {
    let memory = get_memory(creep);
    let target = Game.getObjectById(memory.target.mine);
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
    switch(creep.harvest(target)) {
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