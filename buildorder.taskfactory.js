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

const LO_EnergyPath = require("layout.energy_path");
const LO_Extensions = require("layout.extension");
const LO_MineContainers = require("layout.minecontainers")

const BO_Bootup = require("build.bootup");
const BO_Miner = require("build.miner");
const BO_Worker = require("build.worker");

module.exports = function(opts) {
    let cmd = null;
    if (!opts.name) {
        debug.logError(`[build.factory] warning: ${opts.cmd} command has no name`);
    }
    switch(opts.cmd) {
        case "energy_path":
            cmd = new LO_EnergyPath(opts);
            break;
        case "bootup":
            cmd = new BO_Bootup(opts);
            break;
        case "worker":
            cmd = new BO_Worker(opts);
            break;
        case "extensions":
            cmd = new LO_Extensions(opts);
            break;
        case "mine_containers":
            cmd = new LO_MineContainers(opts);
            break;
        case "miners":
            cmd = new BO_Miner(opts);
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