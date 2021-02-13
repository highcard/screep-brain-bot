/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('build.template');
 * mod.thing == 'a thing'; // true
 */

 // This is very rough, and the memory-init is craptastic/obsolete

module.exports = function(opts){
    
    const cmd_name = "";
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
        return false;
    }

    this.prereq = function() {
        return true;
    }

    this.run = function() {
        return;
    }
    return this;
}