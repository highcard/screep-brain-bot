import * as BehaviorBuild from "./behavior.build";
import CreepFactory from "./creep.factory";
import * as _W from "./constants.worktarget";


const BUILD_MGR_MEMKEY = "build_manager";
const BUILD_RUNNING_MEMKEY = "running";
const BUILD_WAIT_MEMKEY = "wait_queue";

declare interface BuildTask {
    objective: string;
    pos: RoomPosition;
    site: Id<ConstructionSite>;
    type: BuildableStructureConstant;
    assigned: Array<Id<Creep>>;
}

class BuildManager {

    waitqueue : Array<BuildTask>;
    scheduled : Array<BuildTask>;
    running : Array<BuildTask>;
    room : Room;
    idle_creeps: Array<Creep>;

    // Constructor Creates Instance for each RoomkoomDirector
    constructor(room : Room) {
        this.room = room;
        this.mem_init();
        this.running = Memory.rooms[this.room.name][BUILD_MGR_MEMKEY][BUILD_RUNNING_MEMKEY];
        this.waitqueue = Memory.rooms[this.room.name][BUILD_MGR_MEMKEY][BUILD_WAIT_MEMKEY];
        this.idle_creeps = _.filter(Game.creeps, (c) => c.memory.idle && c.memory.home_room == room.name && c.memory.role == "worker");
    }

    // Initializes necessary Memory structure
    mem_init() {
        Memory.rooms[this.room.name][BUILD_MGR_MEMKEY] = Memory.rooms[this.room.name][BUILD_MGR_MEMKEY] || {};
        Memory.rooms[this.room.name][BUILD_MGR_MEMKEY][BUILD_RUNNING_MEMKEY] = 
        Memory.rooms[this.room.name][BUILD_MGR_MEMKEY][BUILD_RUNNING_MEMKEY] || [];
        Memory.rooms[this.room.name][BUILD_MGR_MEMKEY][BUILD_WAIT_MEMKEY] = 
        Memory.rooms[this.room.name][BUILD_MGR_MEMKEY][BUILD_WAIT_MEMKEY] || [];
    }

    // the RoomPosition object writes nicely to memory, and its interface is appropriate.
    // Function takes data conforming to the RoomPosition interface (but not necessarily an object) and returns
    // the Game object.
    // Must be used if RoomPosition's methods are called.
    rehydrate_room_position(pos : RoomPosition) : RoomPosition {
        return new RoomPosition(pos.x, pos.y, pos.roomName);
    }

    // Adds a task to the waitqueue or running depending on whether creeps are assigned or not
    // RECONSIDER THIS re: waitqueue, scheduled, running etc. 
    add_task(objective: string, location: RoomPosition, type: BuildableStructureConstant, assigned? : Array<Id<Creep>>) {
        let task = {
            objective: objective,
            pos: location,
            site: null,
            type: type,
            assigned: assigned ? assigned : [],
            complete : false
        };
        if (task.assigned.length > 0) {
            this.running.push(task);
        } else {
            this.waitqueue.push(task);
        }
    }


    /*
    *
    * Task/Structure Verification methods
    *
    */ 

    task_accounted_for(location : RoomPosition, type: BuildableStructureConstant) : boolean {
        let pos = this.rehydrate_room_position(location);
        return this.has_structure(pos, type) != null 
                || this.has_site(pos, type) != null 
                || this.has_running_task(pos, type) != null
                || this.has_scheduled_task(pos, type) != null
                || this.has_queued_task(pos, type) != null;
    }

    has_structure(location: RoomPosition, type: BuildableStructureConstant) : Structure {
        let pos = this.rehydrate_room_position(location);
        let found_structure = _.filter(pos.lookFor(LOOK_STRUCTURES), s => s.structureType == type);
        if (!found_structure) {
            return null;
        }
        return found_structure[0];
    }

    has_site(location: RoomPosition, type: BuildableStructureConstant) : ConstructionSite {
        let pos = this.rehydrate_room_position(location);
        let found_site = _.filter(pos.lookFor(LOOK_CONSTRUCTION_SITES), s => s.structureType == type);
        if (!found_site) {
            return null;
        }
        return found_site[0];
    }

    has_task(location: RoomPosition, type: BuildableStructureConstant, queue: Array<BuildTask>) : BuildTask {
        let pos = this.rehydrate_room_position(location);
        let found_working_task = _.filter(this.running, t => t.pos.isEqualTo(pos) && t.type == type);
        if (!found_working_task) {
            return null;
        }
        return found_working_task[0];
    }

    has_running_task(location: RoomPosition, type: BuildableStructureConstant) : BuildTask {
        return this.has_task(location, type, this.running);
    }

    has_scheduled_task(location: RoomPosition, type: BuildableStructureConstant) : BuildTask {
        return this.has_task(location, type, this.scheduled);
    }   

    has_queued_task(location: RoomPosition, type: BuildableStructureConstant) : BuildTask {
        return this.has_task(location, type, this.waitqueue)
    }

    /* 
    *
    *
    * Creep Memory Management Methods
    *
    * 
    */

    assign_task_to_creep(task : BuildTask, creep : Creep) {
        let creep_mem = creep.memory;
        if (BehaviorBuild.isBuildMemory(creep_mem)) {
            // assign creep memory
            creep_mem.target.build = task.site;
            creep_mem.task.id = task.objective;
            creep_mem.task.type = PUTTARGET_BUILD;
            creep_mem.idle = false;
            // assign task memory
            if (!task.assigned.includes(creep.id)) {
                task.assigned.push(creep.id);
            }
        }
    }

    release_creep(creep_id : Id<Creep>) {
        let creep = Game.creeps[creep_id];
        if (!creep) {
            return;
        }
        let creep_mem = creep.memory;
        if (BehaviorBuild.isBuildMemory(creep_mem)) {
            creep_mem.target.build = null;
            creep_mem.task.id = null;
            creep_mem.task.type = null;
            creep_mem.idle = true;
        }
    }

    release_assigned_creeps(task: BuildTask) {
        let creep_id : Id<Creep>;
        while (task.assigned.length > 0) {
            creep_id = task.assigned.pop();
            this.release_creep(creep_id);
        }
    }

    /*
    *
    *
    *  Queue Running Methods
    *
    *
    */


    run_tasks() {
        // check all running tasks to see if tasks are /co, and flag for termination
        // if they're not complete but don't have site or creeps assigned, move to "scheduled"
        let task : BuildTask;
        while (this.running.length > 0) {
            task = this.running.shift();

            // Check If Done
            if (this.has_structure(task.pos, task.type)) {
                this.release_assigned_creeps(task);
                continue;
            }

            // Verify that Site Exists
            let site = Game.getObjectById(task.site);
            if (!site) {
                this.release_assigned_creeps(task);
                this.waitqueue.unshift(task);
                continue;
            }

            // verify that all assigned creeps exist and are assigned
            let verified : Array<Id<Creep>> = [];
            for (let c in task.assigned) {
                let creep : Creep = Game.creeps[task.assigned[c]];
                if (!creep || creep.memory.task.id != task.objective) {
                    continue;
                }
                verified.unshift(task.assigned[c]);
            }
            if (verified.length == 0) {
                this.scheduled.unshift()
                continue;
            }
            task.assigned = verified;
            // If the site doesn't exist or if there are no assigned creeps, move back to scheduled
        }
    }

    run_scheduled() {
        // check all scheduled tasks. assign creeps or sites accordingly, and move to "running"
        // if there isn't a valid worker creep, check to see if we can spawn one, and do so
        // (TODO: think about spawn manager system);

        let unassigned : Array<BuildTask>;
        let task : BuildTask;
        while (this.scheduled.length > 0 && this.idle_creeps.length > 0) {
            this.assign_task_to_creep(this.scheduled.pop(), this.idle_creeps.pop());
        }
        while (this.scheduled.length > 0) {
            // Check if we can queue up a spawn, and do so. Move this logic to a room SpawnManger
            task = this.scheduled.pop();
            let memory : WorkerMemory = _W.default_workermemory;
            memory.role = "worker";
            memory.home_room = this.room.name;
            if (CreepFactory.build_creep(this.room, "worker", 300, memory) != OK) {
                this.scheduled.push(task);
                break;
            }
        }
    }

    run_waitqueue() {
        // if "scheduled" is empty, shift/push the next task from `wait_queue`
        if (this.scheduled.length > 0) {
            return;
        }
        let task : BuildTask = this.waitqueue.pop();
        if (!this.has_site(task.pos, task.type)) {
            this.rehydrate_room_position(task.pos).createConstructionSite(task.type);
        }        
        this.scheduled.push(task);
    }


    run() {
        this.run_tasks();
        this.run_scheduled();
        this.run_waitqueue();
    }

}