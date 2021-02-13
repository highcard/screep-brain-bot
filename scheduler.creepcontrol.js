const Debugger = require("utils.debug");
const debug = new Debugger("scheduler.creepcontrol");

const BrainWorker = require('brain.worker');
const BrainMiner = require('brain.miner');
const BrainHauler = require('brain.hauler');

const SchedWorkQueue = require("scheduler.workqueue");

module.exports = function (room) {
    let scheduler = new SchedWorkQueue(room);
    this.run = function() {        
        // Run creep behaviors for all creeps controlled by room Scheduler
        let creeps = _.filter(Game.creeps, (c) => c.memory.home_room == room.name);
        for (let c in creeps) {
            // Get current Creep 
            let creep = creeps[c];
            if (creep == null) {
                debug.logError("creep not found");
                continue;
            }
            let creep_brain;
            // Set CreepBrain
            let found = true;
            switch(creep.memory.role) {
                case "worker":
                    if (creep.memory.task == undefined || creep.memory.task == null) {
                        creep.memory.task = scheduler.get_next_task();
                    }                    
                    creep_brain = new BrainWorker(creep);
                    break;
                case "miner":
                    creep_brain = new BrainMiner(creep);
                    break;
                case "hauler":
                    creep_brain = new BrainHauler(creep);
                    break;
                default:
                    debug.logError("no brain found", creep.name);
                    found = false;
            }
            // Run creepbrain for assigned role
            if (found) {
                creep_brain.run();
            }
        }
        for (let c in creeps) {
            let creep = creeps[c];
            debug.logInfo(`[${creep.name}][${creep.memory.role}][working:${creep.memory.working}][get:${Game.getObjectById(creep.memory.get_target)}][put:${Game.getObjectById(creep.memory.put_target)}][task:${creep.memory.task}]`);
        }
    }
    return this;
}