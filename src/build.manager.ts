import * as BehaviorBuild from "./behavior.build";

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

    wait_queue : Array<BuildTask>;
    scheduled : Array<BuildTask>;
    running : Array<BuildTask>;
    room : Room;
    idle_creeps: Array<Creep>;

    // Constructor Creates Instance for each Room/RoomDirector
    constructor(room : Room) {
        this.room = room;
        this.mem_init();
        this.running = Memory.rooms[this.room.name][BUILD_MGR_MEMKEY][BUILD_RUNNING_MEMKEY];
        this.wait_queue = Memory.rooms[this.room.name][BUILD_MGR_MEMKEY][BUILD_WAIT_MEMKEY];
        this.idle_creeps = _.filter(Game.creeps, (c) => c.memory.idle && c.memory.role == "worker");
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

    // Adds a task to the wait_queue or running depending on whether creeps are assigned or not
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
            this.wait_queue.push(task);
        }
    }

    task_accounted_for(location : RoomPosition, type: BuildableStructureConstant) : boolean {
        let pos = this.rehydrate_room_position(location);
        return this.has_structure(pos, type) != null 
                || this.has_site(pos, type) != null 
                || this.has_running_task(pos, type) != null
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

    has_running_task(location: RoomPosition, type: BuildableStructureConstant) : BuildTask {
        let pos = this.rehydrate_room_position(location);
        let found_working_task = _.filter(this.running, t => t.pos.isEqualTo(pos) && t.type == type);
        if (!found_working_task) {
            return null;
        }
        return found_working_task[0];
    }

    has_queued_task(location: RoomPosition, type: BuildableStructureConstant) : BuildTask {
        let pos = this.rehydrate_room_position(location);
        let found_queued_task = _.filter(this.wait_queue, t => t.pos.isEqualTo(pos) && t.type == type);
        if (!found_queued_task) {
            return null;
        }
        return found_queued_task[0];
    }

    end_task(task: BuildTask) {
        for (let c in task.assigned) {
            // free up the creeps and declare them as idle
            let creep_id = task.assigned[c];
            let mem = Memory.creeps[creep_id]; // TYPEGUARD HERE
            if (BehaviorBuild.isBuildMemory(mem)) {
                mem.target.build = null;
                mem.task = {
                    type: null,
                    id: null
                };
                mem.idle = true;                    
            } else {
                console.log(`build.manager run_task ${creep_id} not WorkerMemory`);
            }
        }
    }

    assign_to_creep(task : BuildTask, creep : Creep) {
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

    // Executes the logic for running a task currently in the build_list;
    run_task(task : BuildTask) {
        // check to see if the task is complete, and free up any assigned creeps if applicable


        // check to see if a site exists, and assign its ID to assigned creeps
        if (!task.site) {
            let site = this.has_site(task.pos, task.type);
            if (!site) {
                // if there's no site, it will be created this tick...
                let pos = this.rehydrate_room_position(task.pos);
                pos.createConstructionSite(task.type);
            }
        }

        // this won't happen until the subsequent tick
        // consider a "task pending" queue.
    }

    run_all() {
        // check all running tasks to see if tasks are /co, and flag for termination
        // if they're not complete but don't have site or creeps assigned, move to "scheduled"
        let task : BuildTask;
        while (this.running.length > 0) {
            task = this.running.shift();
            if (this.has_structure(task.pos, task.type)) {
                this.end_task(task);
                continue;
            }
            // verify that the site exists
            let site = Game.getObjectById(task.site);
            if (!site) {
                // release its creeps
                this.wait_queue.unshift(task);
                continue;
            }

            // verify that all assigned creeps exist and are assigned
            let verified : Array<Id<Creep>> = [];
            for (let c in task.assigned) {
                let creep : Creep = Game.creeps[task.assigned[c]];
                if (!creep || creep.memory.task.id != task.objective) {
                    continue;
                }
                verified.push(task.assigned[c]);
            }
            task.assigned = verified;


            // If the site doesn't exist or if there are no assigned creeps, move back to scheduled
            if (!site || task.assigned.length == 0) {
                this.scheduled.push(task);
            }
        }


        // check all scheduled tasks. assign creeps or sites accordingly, and move to "running"
        // if there isn't a valid worker creep, check to see if we can spawn one, and do so
        // (TODO: think about spawn manager system);

        // if "scheduled" is empty, shift/push the next task from `wait_queue`

        while (this.scheduled.length > 0) {
            
        }

    }

}