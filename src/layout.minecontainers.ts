/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('layout.energy_path');
 * mod.thing == 'a thing'; // true
 */


module.exports = function(opts){
    
    const cmd_name = "mine_containers";
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

    Memory.BuildOrder[room.name].mine_containers = Memory.BuildOrder[room.name].mine_containers || [];    

    this.satisfied = function() {
        return Memory.BuildOrder[room.name].mine_containers.length > 0;
    }

    this.prereq = function() {
        return room.controller.level >= 2;
    }

    this.run = function() {
        const sources = room.find(FIND_SOURCES);
        const controller = room.controller;
        const variance = [-1, 0, 1];

        let terrain = room.getTerrain();
        let rv = new RoomVisual(room.name);
        for (let s in sources) {
            let cur_source = sources[s];
            let sites = [];
            for (let x in variance) {
                for (let y in variance) {
                    let cur_x = cur_source.pos.x + variance[x];
                    let cur_y = cur_source.pos.y + variance[y];
                    if (terrain.get(cur_x, cur_y) != TERRAIN_MASK_WALL) {
                        let cur_pos = new RoomPosition(cur_x, cur_y, room.name)
                        rv.circle(cur_pos, {fill: "#ccc"})
                        sites.push(cur_pos);
                    }
                }
            }
            let closest = controller.pos.findClosestByPath(sites);
            rv.circle(closest, {fill: "#0f0"});
            closest.createConstructionSite(STRUCTURE_CONTAINER);
            Memory.BuildOrder[room.name].mine_containers.push({x: closest.x, y: closest.y});
        }
    }
    return this;
}