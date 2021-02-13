/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('build.extension1');
 * mod.thing == 'a thing'; // true
 */

/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('build.template');
 * mod.thing == 'a thing'; // true
 */

const Debugger = require("utils.debug");
const debug = new Debugger("build.extension");

module.exports = function(opts){
    
    const room = opts.room;

    this.cmd = opts.cmd;
    if (!opts.rcl) {
        debug.logError(`no rcl`, `${opts.name}`);
        return;
    }
    if (!opts.quantity) {
        debug.logError(`no quantity`, `${opts.name}`);
        return;
    }
    
    if (Memory.BuildOrder == undefined || Memory.BuildOrder == null) {
        Memory.BuildOrder = {};
    }
    if (Memory.BuildOrder[room.name]  == undefined || Memory.BuildOrder[room.name] == null) {
        Memory.BuildOrder[room.name] = {};
    }
    if (Memory.BuildOrder[room.name][opts.name] == undefined || Memory.BuildOrder[room.name][opts.name] == null) {
        Memory.BuildOrder[room.name][opts.name] = false;
    }

    this.satisfied = function() {
        return room.controller.level < opts.rcl || Memory.BuildOrder[room.name][opts.name] == true;
    }

    this.prereq = function() {
        return room.controller.level >= opts.rcl;
    }

    this.run = function() {

        let spawns = room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_SPAWN});
        let spawn_pos = spawns[0].pos;
        let num_extensions = room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_EXTENSION}).length;
        num_extensions += room.find(FIND_CONSTRUCTION_SITES, {filter: s => s.structureType == STRUCTURE_EXTENSION}).length;
        let max = opts.quantity;
        let err_break = false;

        for (let dist = 1; num_extensions < max; dist++) {
            let cur_x_offset;
            let cur_y_offset;
            let breakout = false;
            // Starting directly west of spawn, heading north
            for (cur_x_offset = -dist, cur_y_offset = 0; cur_y_offset < dist; cur_y_offset++) {
                if (tryBuild(cur_x_offset, cur_y_offset, spawn_pos)) {
                    if (num_extensions++ >= max) {
                        breakout = true;
                        break;
                    }
                }
            }
            if (breakout) {
                break;
            }

            // starting in northwest heading east
            for (cur_x_offset = -dist, cur_y_offset = dist; cur_x_offset < dist; cur_x_offset++) {
                if (tryBuild(cur_x_offset, cur_y_offset, spawn_pos)) {
                    if(num_extensions++ >= max) {
                        breakout = true;
                        break;
                    }
                }
            }
            if (breakout) {
                break;
            }

            // starting in northeast heading south
            for (cur_x_offset = dist, cur_y_offset = dist; cur_y_offset > -dist; cur_y_offset--) {
                if (tryBuild(cur_x_offset, cur_y_offset, spawn_pos)) {
                    if(num_extensions++ >= max) {
                        breakout = true;
                        break;
                    }
                }
            }
            if (breakout) {
                break;
            }

            // starting in southeast heading west
            for (cur_x_offset = dist, cur_y_offset = -dist; cur_x_offset > -dist; cur_x_offset--) {
                if (tryBuild(cur_x_offset, cur_y_offset, spawn_pos)) {
                    if(num_extensions++ >= max) {
                        breakout = true;
                        break;
                    }
                }
            }
            if (breakout) {
                break;
            }

            // heading back north
            for (cur_x_offset = -dist, cur_y_offset = -dist; cur_y_offset < 0; cur_y_offset++) {
                if (tryBuild(cur_x_offset, cur_y_offset, spawn_pos)) {
                    if(num_extensions++ >= max) {
                        breakout = true;
                        break;
                    }
                }
            }
            if (breakout) {
                break;
            }
        }
        Memory.BuildOrder[room.name][opts.name] = true;
        return;
    }

    const tryBuild = function (x_off, y_off, center) {
        debug.logInfo(`hit tryBuild x:[${x_off}] y:[${y_off}] center:[${center}], room.name: [${room.name}]`)
        let cur_pos = new RoomPosition(center.x + x_off, center.y + y_off, room.name)
        let retval;
        let extension = false;
        if (x_off % 2 == y_off % 2) {
            retval = cur_pos.createConstructionSite(STRUCTURE_EXTENSION);
            if (retval == OK) {
                return true;
            }
        } else {
            retval = cur_pos.createConstructionSite(STRUCTURE_ROAD);
        }
        return false;
    }

    return this;
}