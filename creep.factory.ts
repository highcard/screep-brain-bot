const Debugger = require("utils.debug");
const debug = new Debugger("creep.factory");

module.exports = function() {

    const PARTS = {
        [MOVE] : 50,
        [WORK] : 100,
        [CARRY] : 50,
        [ATTACK] : 80,
        [RANGED_ATTACK] : 150,
        [HEAL] : 250,
        [CLAIM] : 600,
        [TOUGH] : 10,
    };

    const BODIES = {
        worker: [
            [WORK, CARRY, CARRY, MOVE, MOVE], // RCL 1 300 energy
            [MOVE,MOVE,MOVE,WORK,WORK,CARRY,CARRY,CARRY,CARRY] // RCL 2        
        ],
        miner: [
            [CARRY, WORK, WORK, WORK, WORK, MOVE, MOVE], // RCL 2
            [CARRY, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE] // RCL 3    
        ],
        hauler: [
            [MOVE,MOVE,MOVE,CARRY,CARRY,CARRY], //rcl 1: 300
            [MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY] //RCL 2: 500energy        
        ]
    };

    // Returns a valid creep body based on role and maximum energy, null otherwise
    this.get_body = function(role, max_energy) {
        let body = null;
        debug.logInfo(`generating body for role: ${role} max_energy: ${max_energy}`)
        let bodies = BODIES[role];
        if (bodies == undefined || bodies.length == 0) {
            debug.logError(`bodytype not found for role: ${role}`, `get_body`);
        }
        for (let b in bodies) {
            let creep_cost = this.calculate_creep_cost(bodies[b]);
            let cur_max = 0;
            if (creep_cost <= max_energy) {
                body = bodies[b];
                cur_max = creep_cost;
            }
        }
        return body;
    }

    // pre: opts.room != null
    // pre: opts.role != null && opts.role matches one of the above roles in BODIES
    // pre: opts.maxenergy is provided
    // pre: optional opts.memory
    // post: returns X if creep spawning scheduled successfully, null otherwise
    this.build_creep = function(opts) {
        if (opts.room == undefined || opts.room == null) {
            debug.logError(`opts.room invalid`, "build_creep");
            return null;
        };
        let room = opts.room;
        let spawns = room.find(FIND_MY_SPAWNS, {filter: s => s.isActive() && !s.spawning});
        if (spawns.length == 0) {
            debug.logError(`no spawns available`, "build_creep");
            return null;
        };
        let spawn = spawns[0];
        let body = this.get_body(opts.role, opts.energy);
        if (!body) {
            debug.logError(`no valid body found for role: ${opts.role}, energy: ${opts.energy}`, "build_creep");
            return null
        };
        let name = this.generate_creep_name(opts);
        let memory = {
            role: opts.role,
            home_room: room.name        }
        if (opts.memory) {
            for (let m in opts.memory) {
                memory[m] = opts.memory[m];
            }
        }
        let retval = spawn.spawnCreep(body, name, {
            memory: memory
        });
        return retval;
    }

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