/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('buildorder.queue');
 * mod.thing == 'a thing'; // true
 */
const Debugger = require("utils.debug");
const debug = new Debugger("buildorder.queue");

const BuildFactory = require("buildorder.taskfactory");

module.exports = function() {
    var queue = [];
    
    function validateArgs(opts) {
        let name = opts.name;
        if (name == undefined) {
            debug.logError("cmd has no name");
        }
        let required = ["satisfied", "prereq", "run", "cmd"];
        let missing = [];
        let valid = true;
        for (let prop in required) {
            let cur_prop = required[prop];
            try { 
                if (opts[cur_prop] == undefined) {
                    throw "prereq undefined";
                }
            }
            catch (err) {
                debug.logError(`${name} missing property ${cur_prop}`)
                valid = false;            
            }
        }
        return valid;
    }

    this.addCmd = function(opts) {
        debug.log("adding command");
        let cmd = new BuildFactory(opts);
        if(validateArgs(cmd)) {
            queue.push(cmd);
        } else {
            debug.logError("did not push cmd");
        }
    }

    this.run = function() {
        while (queue.length > 0) {
            let cmd = queue.shift();
            if (cmd.satisfied()) {
                debug.logInfo(`satisfied`, `[${cmd.name}]`)
                continue;
            }
            if (cmd.prereq()) {
                debug.logInfo(`executing`, `[${cmd.name}]`)
                let retval = cmd.run();
                if (retval != 0) {
                    break;
                }
                if (retval == 0) {
                    break;
                }
            } else {
                debug.logInfo(`failed_prereqs`, `[${cmd.name}]`);
                break;
            }
        }
    }
}