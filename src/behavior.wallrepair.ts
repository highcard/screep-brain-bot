/// <reference path="./creepmemory.worker.ts" />

interface WallRepairMemory extends WorkerMemory {
    target: {
        wallrepair: Id<WallRepairTarget>;
    }
}

const get_memory = function(creep : Creep) : WallRepairMemory {
    return creep.memory as WallRepairMemory;
}

const get_target = function(creep : Creep) : WallRepairTarget {
    let memory = get_memory(creep);
    let target = Game.getObjectById(memory.target.wallrepair);
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
    switch(creep.repair(target)) {
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