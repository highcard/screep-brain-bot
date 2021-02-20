/// <reference path="./creepmemory.worker.ts" />

interface RepairMemory extends WorkerMemory {
    target: {
        repair: Id<RepairTarget>;
    };
}

const isRepairMemory = function(x : CreepMemory): x is RepairMemory {
    return (x as CreepMemory).target !== undefined
        && (x as CreepMemory).target.repair !== undefined
        && (x as CreepMemory).idle !== undefined
        && (x as CreepMemory).working !== undefined
        && (x as CreepMemory).role !== undefined
        && (x as CreepMemory).home_room !== undefined;
}

const get_memory = function(creep : Creep) : RepairMemory {
    return creep.memory as RepairMemory;
}

const get_target = function(creep : Creep) : RepairTarget {
    let memory = get_memory(creep);
    let target = Game.getObjectById(memory.target.repair);
    if (!target) {
        return null;
    }
    return target;
}    

const run = function(creep : Creep) : boolean {
    let target = get_target(creep);
    if (!target || target.hits == target.hitsMax) {
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

export {run, isRepairMemory};