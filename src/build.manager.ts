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
    complete?: boolean;
}

class BuildManager {

    running : Array<BuildTask>;
    wait_queue : Array<BuildTask>;
    room : Room;

    // Constructor Creates Instance for each Room/RoomDirector
    constructor(room : Room) {
        this.room = room;
        this.mem_init();
        this.running = Memory.rooms[this.room.name][BUILD_MGR_MEMKEY][BUILD_RUNNING_MEMKEY];
        this.wait_queue = Memory.rooms[this.room.name][BUILD_MGR_MEMKEY][BUILD_WAIT_MEMKEY];
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

    // Executes the logic for running a task currently in the build_list;
    run_task(task : BuildTask) {
        // check to see if the task is complete, and free up any assigned creeps if applicable
        if (this.has_structure(task.pos, task.type)) {
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
            task.complete = true;
            return;
        }

        // check to see if there's a site set (TODO: Edgecase that site exists but is desyncd with stored value)
        if (!task.site) {
            let site = this.has_site(task.pos, task.type);
            if (!site) {
                let pos = this.rehydrate_room_position(task.pos);
                pos.createConstructionSite(task.type);
            } else {
                task.site = site.id;
                for (let c in task.assigned) {
                    let creep_id = task.assigned[c];
                    let creep_mem = Memory.creeps[creep_id];
                    if (BehaviorBuild.isBuildMemory(creep_mem)) {                    
                        creep_mem.target.build = site.id;
                    }
                }
            }
        }

        if (task.site) {
            let site = Game.getObjectById(task.site);
            if (!site) {
                task.site = null;
            }
        }
    }
}