module.exports = function(opts) {

    const TASK_ROOT = "_tasks";

    let OPTS = {
        task_id: "something unique",
        director: RoomDirector // RoomDirector should keep track of screeps to repurpose
    }

    this cmd_name = "container_mining";

    this.builders = []; // array of builder creeps

    this.miners = []; // miners exclusively assigned to this source
    this.haulers = []; // haulers exclussively assigned to this source
    this.structures = [];

    this.spawns = opts.director.get_spawns() // This should somehow filter all reasonable spawns capable of assisting
    // Make layout
    // requisition or build creeps to execute the layout
    // after the layout is complete, ensure there are assigned creeps

    this.satisfiedStructures = function() {
        // returns true if the applicable structure(s) exist
        // otherwise tasks to create structures
    }

    this.assignBuilders= function() {
        // returns true if builder requirement is satisfied
        // otherwise tasks to create builders
    }

    this.satisfiedWorkers = function() {
        return satisfiedMiners() && satisfiedHaulers();
    }

    this.run = function () {

    }

    const mem_init = function() {
        Memory[TASK_ROOT] = Memory[TASK_ROOT] || {};
        Memory[TASK_ROOT][opts.task_id] = Memory[TASK_ROOT][opts.task_id] || {
            name: "cmd_name",
            assigned: []
        };
        for (let c in Memory[TASK_ROOT][opts.task_id]) {

        }
    }

    const satisfiedMiners = function() {
        // returns true if miner requirement is satisfied
        // otherwise, tasks to create miner(s)
    }

    const satisfiedHaulers = function() {
        // returns true if hauler requirement is satisfied
        // otherwise, tasks to create hauler(s)
    }

}


if (!satisfiedStructures) {

}