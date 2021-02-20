import * as _W from "./constants.worktarget";

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
        [MOVE,WORK,WORK,CARRY], // RCL 1: 300 enegy
        [MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY], // RCL 2: 500 energy
        [MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY] // RCL 3: 800 energy
    ],
    hauler: [
        [MOVE,MOVE,MOVE,CARRY,CARRY,CARRY], //rcl 1: 300
        [MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY] //RCL 2: 500energy        
    ]
};

export default class CreepFactory {

    // Returns a valid creep body based on role and maximum energy, null otherwise
    public static get_body(body_profile : string, max_energy : number) : Array<BodyPartConstant> {
        let body = null;
        let bodies = BODIES[body_profile];
        if (bodies == undefined || bodies.length == 0) {
            return null;
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

   public static build_creep(room : Room, body_profile : string, energy: number, memory? : CreepMemory): number {
        let spawns = room.find(FIND_MY_SPAWNS, {filter: s => s.isActive() && !s.spawning});
        if (spawns.length == 0) {
            return -99; // TEMP HACK FIX THIS.
        };
        let spawn = spawns[0];
        let body = this.get_body(body_profile, energy);
        if (!body) {
            return -99 // TEMP HACK FIX THIS.
        };
        let name = this.generate_creep_name(room, body_profile);
        let retval = spawn.spawnCreep(body, name, {
            memory: memory ? memory : {}
        });
        return retval;
    }

    public static generate_creep_name(room : Room, body_profile : string) : string {
        for (let i = 0; true; i++) {
            let next_creep_name = `${room.name}_${body_profile}_${i}`;
            if (Game.creeps[next_creep_name] == null) {
                return next_creep_name;
            }
        }
        // Should never reach here.
        return "";
    }

    public static calculate_creep_cost(body: Array<BodyPartConstant>) {
        let total = 0;
        for (let b in body) {
            total += PARTS[body[b]];
        }
        return total;
    }

 }
