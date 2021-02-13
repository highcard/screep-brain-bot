/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('buildorder.cmd');
 * mod.thing == 'a thing'; // true
 */

const MEMKEY = "";
const PARTS = {};
PARTS[MOVE] = 50;
PARTS[WORK] = 100;
PARTS[CARRY] = 50;
PARTS[ATTACK] = 80;
PARTS[RANGED_ATTACK] = 150;
PARTS[HEAL] = 250;
PARTS[CLAIM] = 600;
PARTS[TOUGH] = 10;

module.exports = function() {

    this.generate_creep_name = function(opts) {
        for (let i = 0; true; i++) {
            let next_creep_name = `${opts.room.name}_${opts.role}_${i}`;
            if (Game.creeps[next_creep_name] == null) {
                return next_creep_name;
            }
        }
        // Should never reach here.
        return "";
    }

    this.calculate_creep_cost = function(body) {
        let total = 0;
        for (let b in body) {
            total += PARTS[body[b]];
        }
        return total;
    }

    return this;
 }