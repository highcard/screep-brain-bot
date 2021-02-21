import CreepFactory from "./creep.factory";
import * as _W from "./constants.worktarget";
import { BrainMiner } from "./brain.miner";

/// <reference path="./builorder.command" />

const ROLE_MINER = "miner";

function isContainer(x : Structure): x is StructureContainer {
    return (x as StructureContainer).structureType === STRUCTURE_CONTAINER;
}

const ObjectiveMining : BuildCommand = {

    satisfied : function(room : Room, cmd : CommandOptions) : boolean {
        let curRoleCreeps = _.filter(Game.creeps, function(c) {
            return c.memory.role == ROLE_MINER && c.memory.home_room == room.name && c.memory.target.harvest == cmd.source_entry.id;
        });

        let pos = new RoomPosition(cmd.source_entry.container.x, cmd.source_entry.container.y, room.name);

        let containers = _.filter(pos.lookFor(LOOK_STRUCTURES), (s:Structure) => s.structureType == STRUCTURE_CONTAINER);
        let sites = _.filter(pos.lookFor(LOOK_CONSTRUCTION_SITES), (s: ConstructionSite) => s.structureType = STRUCTURE_CONTAINER);
        if (containers.length == 0 && sites.length == 0) {
            pos.createConstructionSite(STRUCTURE_CONTAINER);
        }

        return (curRoleCreeps.length > 0 && (containers.length > 0 || sites.length > 0));
    },
    
    prereq : function(room : Room, cmd : CommandOptions) : boolean {
        let energy = this.room.energyAvailable;
        let energy_min = Math.min(this.room.energyCapacityAvailable, 800);
        return energy >= energy_min;
    },
    
    run : function(room : Room, cmd : CommandOptions) {
        let container_id : Id<StructureContainer> = null;
        let site_id : Id<ConstructionSite> = null;
        if (cmd.source_entry.container) {
            let pos = new RoomPosition(cmd.source_entry.container.x, cmd.source_entry.container.y, room.name);
            let containers = _.filter(pos.lookFor(LOOK_STRUCTURES), (s:Structure) => s.structureType == STRUCTURE_CONTAINER);
            if (containers.length > 0 && isContainer(containers[0])) {
                container_id = containers[0].id;
            } else {
                let sites = _.filter(pos.lookFor(LOOK_CONSTRUCTION_SITES), (s: ConstructionSite) => s.structureType = STRUCTURE_CONTAINER);
                if (sites.length > 0) {
                    site_id = sites[0].id;
                } else {
                    pos.createConstructionSite(STRUCTURE_CONTAINER);
                }
            }
        }
        let source_id : Id<Source> = cmd.source_entry.id;
        CreepFactory.build_creep(
            this.room,
            this.role,
            this.room.energyAvailable,
            _W.default_workermemory
        );
    }

};

export {ObjectiveMining};