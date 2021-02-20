import * as BehaviorBuild from "./behavior.build";
import CreepFactory from "./creep.factory";
import * as _W from "./constants.worktarget";


const BUILD_MGR_MEMKEY = "build_manager";
const BUILD_RUNNING_MEMKEY = "running";
const BUILD_WAIT_MEMKEY = "waitqueue";
const BUILD_SCHEDULED_MEMKEY = "scheduled";

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
        console.log("buid.manager constructor");
        this.room = room;
        this.mem_init();
        this.running = Memory.rooms[this.room.name][BUILD_MGR_MEMKEY][BUILD_RUNNING_MEMKEY];
        this.waitqueue = Memory.rooms[this.room.name][BUILD_MGR_MEMKEY][BUILD_WAIT_MEMKEY];
        this.scheduled = Memory.rooms[this.room.name][BUILD_MGR_MEMKEY][BUILD_SCHEDULED_MEMKEY];
        this.idle_creeps = _.filter(Game.creeps, (c) => c.memory.idle && c.memory.home_room == room.name && c.memory.role == "worker");
    }

    // Initializes necessary Memory structure
    mem_init() {
        Memory.rooms[this.room.name][BUILD_MGR_MEMKEY] = Memory.rooms[this.room.name][BUILD_MGR_MEMKEY] || {};
        Memory.rooms[this.room.name][BUILD_MGR_MEMKEY][BUILD_RUNNING_MEMKEY] = 
        Memory.rooms[this.room.name][BUILD_MGR_MEMKEY][BUILD_RUNNING_MEMKEY] || [];
        Memory.rooms[this.room.name][BUILD_MGR_MEMKEY][BUILD_WAIT_MEMKEY] = 
        Memory.rooms[this.room.name][BUILD_MGR_MEMKEY][BUILD_WAIT_MEMKEY] || [];
        Memory.rooms[this.room.name][BUILD_MGR_MEMKEY][BUILD_SCHEDULED_MEMKEY] = 
        Memory.rooms[this.room.name][BUILD_MGR_MEMKEY][BUILD_SCHEDULED_MEMKEY] || [];
    }

    write_mem() {
        Memory.rooms[this.room.name][BUILD_MGR_MEMKEY][BUILD_RUNNING_MEMKEY] = this.running;
        Memory.rooms[this.room.name][BUILD_MGR_MEMKEY][BUILD_WAIT_MEMKEY] = this.waitqueue;
        Memory.rooms[this.room.name][BUILD_MGR_MEMKEY][BUILD_SCHEDULED_MEMKEY] = this.scheduled;
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
    add_task(objective: string, location: RoomPosition, type: BuildableStructureConstant) {
        console.log('build.manager add_task');
        if (!this.task_accounted_for(location, type)) {
            console.log('build.manager add_task registering task');
            let task = {
                objective: objective,
                pos: location,
                site: null,
                type: type,
                assigned: [],
            };
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
        console.log("build.manager task_accounted_for");
        return this.has_structure(pos, type) != null 
                || this.has_site(pos, type) != null 
                || this.has_running_task(pos, type) != null
                || this.has_scheduled_task(pos, type) != null
                || this.has_queued_task(pos, type) != null;
    }

    has_structure(location: RoomPosition, type: BuildableStructureConstant) : Structure {
        console.log("build.manager has_structure");
        let pos = this.rehydrate_room_position(location);
        let found_structure = _.filter(pos.lookFor(LOOK_STRUCTURES), s => s.structureType == type);
        if (!found_structure) {
            return null;
        }
        return found_structure[0];
    }

    has_site(location: RoomPosition, type: BuildableStructureConstant) : ConstructionSite {
        console.log("build.manager has_site");        
        let pos = this.rehydrate_room_position(location);
        let found_site = _.filter(pos.lookFor(LOOK_CONSTRUCTION_SITES), s => s.structureType == type);
        if (!found_site) {
            return null;
        }
        return found_site[0];
    }

    has_task(location: RoomPosition, type: BuildableStructureConstant, queue: Array<BuildTask>) : BuildTask {
        console.log("build.manager has_task");
        let pos = this.rehydrate_room_position(location);
        let found_working_task = _.filter(queue, t => this.rehydrate_room_position(t.pos).isEqualTo(pos) && t.type == type);
        if (!found_working_task) {
            return null;
        }
        return found_working_task[0];
    }

    has_running_task(location: RoomPosition, type: BuildableStructureConstant) : BuildTask {
        console.log("build.manager has_running_task");
        return this.has_task(location, type, this.running);
    }

    has_scheduled_task(location: RoomPosition, type: BuildableStructureConstant) : BuildTask {
        console.log("build.manager has_scheduled_task");
        return this.has_task(location, type, this.scheduled);
    }   

    has_queued_task(location: RoomPosition, type: BuildableStructureConstant) : BuildTask {
        console.log("build.manager has_queued_task");
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
            creep_mem.task.type = _W.PUTTARGET_BUILD;
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
        console.log("build.manager run_tasks");
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
                if (!creep || (BehaviorBuild.isBuildMemory(creep.memory) ? creep.memory.target.build : "") != task.site) {
                    continue;
                }
                verified.unshift(task.assigned[c]);
            }
            if (verified.length == 0) {
                this.scheduled.unshift(task);
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
        console.log("build.manager run_scheduled");

        let checked : Array<BuildTask> = [];
        while (this.scheduled.length > 0) {
            let task : BuildTask = this.scheduled.pop();
            if (task.site) {
                checked.push(task);
                continue;
            }
            let site = this.has_site(task.pos, task.type);
            if (site) {
                console.log("build.manager run_scheduled has_site")
                task.site = site.id;
                checked.push(task);
            } else {
                this.waitqueue.unshift(task);
            }
        }

        console.log("HIT", checked);
        this.scheduled = checked;
        console.log("HIT AFTER", this.scheduled);

        while (this.scheduled.length > 0 && this.idle_creeps.length > 0) {
            let task : BuildTask = this.scheduled.pop();
            this.assign_task_to_creep(task, this.idle_creeps.pop());
            this.running.push(task);
        }
        while (this.scheduled.length > 0) {
            // Check if we can queue up a spawn, and do so. Move this logic to a room SpawnManger
            let task : BuildTask = this.scheduled.pop();
            let memory : WorkerMemory = _W.default_workermemory;
            memory.role = "worker";
            memory.home_room = this.room.name;
            console.log("build.manager run_scheduled before build_creep");
            if (CreepFactory.build_creep(this.room, "worker", 300, memory) == OK) {
                this.running.push(task);
            } else {
                this.scheduled.push(task);
                break;        
            }
        }
    }

    run_waitqueue() {
        // if "scheduled" is empty, shift/push the next task from `waitqueue`
        console.log("build.manager run_waitqueue");
        if (this.scheduled.length > 0 || this.waitqueue.length == 0) {
            console.log("build.manager returning run_waitqueue");
            return;
        }
        let task : BuildTask = this.waitqueue.pop();
        if (!this.has_site(task.pos, task.type)) {
            this.rehydrate_room_position(task.pos).createConstructionSite(task.type);
        }
        console.log("build.manager run_waitqueue pushing to scheduled");
        this.scheduled.push(task);
        console.log("build.manager end run_waitqueue");
    }


    run() {
        console.log("build.manager run");
        this.run_tasks();
        this.run_scheduled();
        this.run_waitqueue();
        this.write_mem();
    }

}

export {BuildManager};