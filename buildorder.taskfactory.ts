/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('build.factory');
 * mod.thing == 'a thing'; // true
 */

const Debugger = require("utils.debug");
const debug = new Debugger("buildorder.taskfactory");

const BO_BootupWorker = require("build.bootupworker");

module.exports = function(opts) {
    let cmd = null;
    if (!opts.name) {
        debug.logError(`[build.factory] warning: ${opts.cmd} command has no name`);
    }
    switch(opts.cmd) {
        case "bootupworker":
            cmd = new BO_BootupWorker({room: opts.room, cmd: opts.cmd});
            break;
        default:
            debug.logError(`${[opts.cmd]} not recognized`);
            cmd = null;
        }
    if (cmd != null && cmd.name == undefined) {
        cmd.name = opts.name;
    }
    return cmd;
};