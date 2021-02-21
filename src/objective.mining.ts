import CreepFactory from "./creep.factory";
import * as _W from "./constants.worktarget";
import { BrainMiner } from "./brain.miner";

/// <reference path="./builorder.command" />
/// <reference path="./room.memory" />

const ROLE_MINER = "miner";

function isContainer(x : Structure): x is StructureContainer {
    return (x as StructureContainer).structureType === STRUCTURE_CONTAINER;
}

interface ObjectiveMiningOptions {
    objective: "mining",
    source: SourceEntry
}

function isObjectiveMiningOptions(x : CommandOptions) : x is ObjectiveMiningOptions {
    return (x as ObjectiveMiningOptions).source !== undefined 
}

const ObjectiveMining : BuildCommand = {

    satisfied : function(room : Room, cmd : CommandOptions) : boolean {

        if (!isObjectiveMiningOptions(cmd)) {
            console.log("objective.mining satisfied invalid options");
            return false;
        }
        let opts : ObjectiveMiningOptions = cmd;

        let curRoleCreeps = _.filter(Game.creeps, function(c) {
            return c.memory.role == ROLE_MINER && c.memory.home_room == room.name && c.memory.target.harvest == opts.source.id;
        });

        let pos = new RoomPosition(opts.source.container.x, opts.source.container.y, room.name);

        let containers = _.filter(pos.lookFor(LOOK_STRUCTURES), (s:Structure) => s.structureType == STRUCTURE_CONTAINER);
        let sites = _.filter(pos.lookFor(LOOK_CONSTRUCTION_SITES), (s: ConstructionSite) => s.structureType == STRUCTURE_CONTAINER);
        if (containers.length == 0 && sites.length == 0) {
            pos.createConstructionSite(STRUCTURE_CONTAINER);
        }

        return (curRoleCreeps.length > 0 && (containers.length > 0 || sites.length > 0));
    },
    
    prereq : function(room : Room, cmd : CommandOptions) : boolean {
        let energy = room.energyAvailable;
        let energy_min = Math.min(room.energyCapacityAvailable, 800);
        return energy >= energy_min;
    },
    
    run : function(room : Room, cmd : CommandOptions) {
        if (!isObjectiveMiningOptions(cmd)) {
            console.log("objective.mining run invalid options");
            return;
        }

        let opts : ObjectiveMiningOptions = cmd;

        // Set RoomObject Ids for potential creep targets
        let source_id : Id<Source> = opts.source.id;
        let container_id : Id<StructureContainer> = null;
        let site_id : Id<ConstructionSite> = null;
        if (opts.source.container) {
            let pos = new RoomPosition(opts.source.container.x, opts.source.container.y, room.name);
            let containers = _.filter(pos.lookFor(LOOK_STRUCTURES), (s:Structure) => s.structureType == STRUCTURE_CONTAINER);
            if (containers.length > 0 && isContainer(containers[0])) {
                container_id = containers[0].id;
            } else {
                let sites = _.filter(pos.lookFor(LOOK_CONSTRUCTION_SITES), (s: ConstructionSite) => s.structureType == STRUCTURE_CONTAINER);
                if (sites.length > 0) {
                    site_id = sites[0].id;
                } else {
                    pos.createConstructionSite(STRUCTURE_CONTAINER);
                }
            }
        }

        // Initialize worker memory
        let memory : WorkerMemory = _W.default_minermemory;
        memory.target.harvest = source_id;
        if (container_id) {
            memory.target.repair = container_id;
            memory.target.haul = container_id;
        }
        if (site_id) {
            memory.target.build = site_id;
        }
        memory.idle = false;

        // Spawn Miner
        CreepFactory.build_creep(
            room,
            ROLE_MINER,
            room.energyAvailable,
            memory
        );
    }

};

export {ObjectiveMining};