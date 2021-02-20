/// <reference path="./creepmemory.worker.ts" />

interface HaulMemory extends WorkerMemory {
    target: {
        haul: Id<ContainerTarget>;
    };
}

const isHaulMemory = function(x : CreepMemory): x is HaulMemory {
    return (x as CreepMemory).target !== undefined
        && (x as CreepMemory).target.haul !== undefined
        && (x as CreepMemory).idle !== undefined
        && (x as CreepMemory).working !== undefined
        && (x as CreepMemory).role !== undefined
        && (x as CreepMemory).home_room !== undefined;
}

const get_target = function(creep : Creep) : ContainerTarget {
    let memory = creep.memory;
    if (isHaulMemory(memory)) {
        let target = Game.getObjectById(memory.target.haul);
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

export {run, isHaulMemory};