import CreepFactory from "./creep.factory";
import * as _W from "./constants.worktarget";
import * as BehaviorHarvest from "./behavior.harvest";
import * as BehaviorWithdraw from "./behavior.withdraw";

const isStructureStorage = function(x : AnyStructure): x is StructureStorage {
    return (x as StructureStorage).store !== undefined; // This could be better
}

const isStructureContainer = function(x : AnyStructure): x is StructureContainer {
    return (x as StructureContainer).store !== undefined; // This could be better
}


class EnergyDirector {
    room : Room;
    sources : Array<Source>;
    containers : Array<StructureContainer>;
    storage : StructureStorage;
    recycle : ContainerTarget;
    creeps : Array<Creep>;

    constructor(room : Room) {
        console.log("energy.manager EnergyDirector constructor");
        this.room = room;
        let containers = this.room.find(FIND_STRUCTURES, 
            {filter: s => s.structureType == STRUCTURE_CONTAINER 
                && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0});
        this.containers = containers as Array<StructureContainer>;  // HACK. FIX THIS.
        this.sources = this.room.find(FIND_SOURCES);
        let storage = this.room.find(FIND_STRUCTURES, 
            {filter: s=> isStructureStorage(s) 
                && s.structureType == STRUCTURE_STORAGE});
        this.storage = storage ? storage[0] as StructureStorage : null; // HACK. FIX THIS.
        this.recycle = null;
        this.creeps = _.filter(Game.creeps, (c : Creep) => BehaviorHarvest.isHarvestMemory(c.memory) ? (c.memory.home_room == this.room.name && c.memory.role == "worker") : false);
        console.log(this.creeps); // this.creeps is returning an empty array. troubleshoot
    }

    run() {
        for (let c in this.creeps) {
            let creep = this.creeps[c];
            let creep_mem = creep.memory;
            if (BehaviorWithdraw.isWithdrawMemory(creep_mem)) {
                if (creep_mem.target.withdraw != null) {
                    console.log("continuing withdraw");
                    continue;
                }
            }
            if (BehaviorHarvest.isHarvestMemory(creep_mem)) {
                if (creep_mem.target.harvest != null) {
                    console.log("continuing harvest");
                    continue;
                }
            }
            this.fetch_energy(creep);
        }
    }

    set_get_target_source(creep : Creep) : boolean {
        let min = Infinity;
        let min_source : Source;
        for (let s in this.sources) {
            let source = this.sources[s];
            let source_creeps = _.filter(this.creeps, function(c) {
                if (BehaviorHarvest.isHarvestMemory(c.memory)) {
                    return c.memory.target.harvest == source.id; 
                } else {
                    return false;
                }
            });
            if (source_creeps.length < min) {
                min = source_creeps.length;
                min_source = source;
            }
        }
        if (!min_source) {
            return false;
        }
        creep.memory.target.harvest = min_source.id;
        return true;        
    }


    aggregate_container(container) : number {
        let energy = container.store.getUsedCapacity(RESOURCE_ENERGY);
        let floor_energy = container.pos.lookFor(LOOK_ENERGY);
        if (floor_energy.length > 0) {
            energy += floor_energy[0].amount;
        }
        return energy;
    }

    set_get_target_container(creep : Creep) : boolean {
        let containers = _.filter(this.containers,
            s => s.structureType == STRUCTURE_CONTAINER && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0);
        let container;
        if (containers.length == 0) {
            return false;
        }
        container = _.max(this.containers, this.aggregate_container);
        creep.memory.target.withdraw = container.id;
        return true;
    }


    set_get_target_dropped(creep : Creep) : boolean {
        let dropped = this.room.find(FIND_DROPPED_RESOURCES, {
            filter: r => r.resourceType == RESOURCE_ENERGY 
                    && r.pos.lookFor(LOOK_STRUCTURES).length == 0
        });
        if (dropped.length > 0) {
            dropped.sort(r => r.amount);
            creep.memory.target.withdraw = dropped[0].id;
            return true;
        }
        return false;
    }

    set_get_target_tombstone(creep : Creep) : boolean {
        let tombstones = this.room.find(FIND_TOMBSTONES, {
           filter: t => t.store.getUsedCapacity(RESOURCE_ENERGY) > 0
        });
        if (tombstones.length > 0) {
            tombstones.sort(r => r.store.getUsedCapacity(RESOURCE_ENERGY));
            creep.memory.target.withdraw = tombstones[0].id;
            return true;
        }
        return false;
    }

    cleanup_energy(creep) {
        return this.set_get_target_dropped(creep) || this.set_get_target_tombstone(creep);
    }

    fetch_energy(creep) {
        console.log("fetch_energy hit");
        return this.set_get_target_container(creep) || this.set_get_target_source(creep);
    }


}

export {EnergyDirector}