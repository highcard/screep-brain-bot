/// <reference path="./creepmemory.worker.ts" />

interface UpgradeMemory extends WorkerMemory {
    target: {
        upgrade: Id<StructureController>;
    };
}


const get_memory = function(creep : Creep) : UpgradeMemory {
    return creep.memory as UpgradeMemory;
}

const get_target = function(creep : Creep) : StructureController {
    let memory = get_memory(creep);
    let target = Game.getObjectById(memory.target.upgrade);
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