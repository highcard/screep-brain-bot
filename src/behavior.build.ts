/// <reference path="./creepmemory.worker.ts" />

interface BuildMemory extends WorkerMemory {
    target: {
        build: Id<ConstructionSite>;
    };
}

const isBuildMemory = function(x : CreepMemory): x is BuildMemory {
    return (x as CreepMemory).target !== undefined
        && (x as CreepMemory).target.build !== undefined
        && (x as CreepMemory).idle !== undefined
        && (x as CreepMemory).working !== undefined
        && (x as CreepMemory).role !== undefined
        && (x as CreepMemory).home_room !== undefined;
}

const get_target = function(creep : Creep) : ConstructionSite {
    let memory = creep.memory;
    if (isBuildMemory(memory)) {
        let target = Game.getObjectById(memory.target.build);
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
    switch(creep.build(target)) {
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

export {run, isBuildMemory};