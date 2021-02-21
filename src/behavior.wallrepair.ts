/// <reference path="./creepmemory.worker.ts" />

interface WallRepairMemory extends WorkerMemory {
    target: {
        wallrepair: Id<WallRepairTarget>;
    }
}

const isWallRepairMemory = function(x : CreepMemory): x is WallRepairMemory {
    return (x as CreepMemory).target !== undefined
        && (x as CreepMemory).target.wallrepair !== undefined
        && (x as CreepMemory).idle !== undefined
        && (x as CreepMemory).working !== undefined
        && (x as CreepMemory).role !== undefined
        && (x as CreepMemory).home_room !== undefined;
}

const get_target = function(creep : Creep) : WallRepairTarget {
    let memory = creep.memory;
    if (isWallRepairMemory(memory)) {
        let target = Game.getObjectById(memory.target.wallrepair);
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

export {run, isWallRepairMemory};