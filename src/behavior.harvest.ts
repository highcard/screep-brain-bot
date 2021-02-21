/// <reference path="./creepmemory.worker.ts" />

interface HarvestMemory extends WorkerMemory {
    target: {
        harvest: Id<Source>;
    }
}

const isHarvestMemory = function(x : CreepMemory): x is HarvestMemory {
    return (x as CreepMemory).target !== undefined
        && (x as CreepMemory).target.harvest !== undefined
        && (x as CreepMemory).idle !== undefined
        && (x as CreepMemory).working !== undefined
        && (x as CreepMemory).role !== undefined
        && (x as CreepMemory).home_room !== undefined;
}

const get_target = function(creep : Creep) : Source {
    let memory = creep.memory;
    if (isHarvestMemory(memory)) {
        let target = Game.getObjectById(memory.target.harvest);
        if (!target) {
            return null;
        }
        return target;
    }
    return null;
}

const run = function(creep : Creep) : boolean {
    let target = get_target(creep);
    console.log("harvest");
    if (!target) {
        return false;
    }
    switch(creep.harvest(target)) {
        case OK:
            console.log("hit okay");
            break;
        case ERR_NOT_IN_RANGE:
            console.log("hit harvest not in range");
            creep.moveTo(target);
            break;
        default:
            console.log("default");
            break;
    }
    return true;
}

export {run, isHarvestMemory};