/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('layout.energy_path');
 * mod.thing == 'a thing'; // true
 */

const Debugger = require("utils.debug");
const debug = new Debugger("build.energy_path");

module.exports = function(opts){
    
    const cmd_name = "energy_path";
    const room = opts.room;
    
    this.cmd = opts.cmd;
    
    if (Memory.BuildOrder == undefined || Memory.BuildOrder == null) {
        Memory.BuildOrder = {};
    }
    if (Memory.BuildOrder[room.name]  == undefined || Memory.BuildOrder[room.name] == null) {
        Memory.BuildOrder[room.name] = {};
    }
    if (Memory.BuildOrder[room.name][cmd_name] == undefined || Memory.BuildOrder[room.name][cmd_name] == null) {
        Memory.BuildOrder[room.name][cmd_name] = false;
    }

    this.satisfied = function() {
        return Memory.BuildOrder[room.name][cmd_name];
    }

    this.prereq = function() {
        return true;
    }

    this.run = function() {
        const spawns = room.find(FIND_STRUCTURES, {
            filter: { structureType: STRUCTURE_SPAWN },
        });
        if (spawns.length == 0) {
            debug.logError(`no spawns`, room.name);
            return;
        }
        const sources = room.find(FIND_SOURCES);
        const controller = room.controller;
        
        let retval = 0;
        let first_spawn = spawns[0];

        let sites = room.find(FIND_CONSTRUCTION_SITES);
        for (let s in sites) {
            sites[s].remove();
        }

        let spawn_roads = [];
        let spawnpos = first_spawn.pos;
        spawn_roads.push(new RoomPosition(spawnpos.x - 1, spawnpos.y, room.name));
        spawn_roads.push(new RoomPosition(spawnpos.x + 1, spawnpos.y, room.name));
        spawn_roads.push(new RoomPosition(spawnpos.x, spawnpos.y - 1, room.name));
        spawn_roads.push(new RoomPosition(spawnpos.x, spawnpos.y + 1, room.name));

        let all_roads = [];
        for (let s in spawn_roads) {
            let spawn_road = spawn_roads[s];
            all_roads.push(spawn_road);
        }
        for (let s in sources) {
            let opts = {
                ignoreCreeps: true,
                ignoreRoads: true,
                plainCost: 1,
                swampCost: 1
            }
            let source = sources[s];
            let target = source.pos.findClosestByPath(spawn_roads, opts);
            let path = source.pos.findPathTo(target, opts);
            for (let p in path) {
                all_roads.push(new RoomPosition(path[p].x, path[p].y, room.name));
            }
        }

        for (let r in all_roads) {
            all_roads[r].createConstructionSite(STRUCTURE_ROAD);
        }
        Memory.BuildOrder[room.name][cmd_name] = true;
        return retval;
    }
    return this;
}