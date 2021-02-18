const BUILD_MGR_MEMKEY = "build_manager";
const BUILD_RUNNING_MEMKEY = "running";
const BUILD_WAIT_MEMKEY = "wait_queue";

declare interface BuildPosition {
    x: number;
    y: number;
    room_name: string; 
}

declare interface BuildTask {
    objective: string;
    pos: BuildPosition;
    site: Id<ConstructionSite>;
    type: BuildableStructureConstant;
    assigned: Array<Id<Creep>>;
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

    // Adds a task to the wait_queue or running depending on whether creeps are assigned or not
    add_task(objective: string, pos: RoomPosition, type: BuildableStructureConstant, assigned? : Array<Id<Creep>>) {
        let position = {
            x: pos.x,
            y: pos.y,
            room_name : pos.roomName,
        };
        let task = {
            objective: objective,
            pos: position,
            site: null,
            type: type,
            assigned: assigned ? assigned : [],
        };
        if (task.assigned.length > 0) {
            this.running.push(task);
        } else {
            this.wait_queue.push(task);
        }
    }

    task_accounted_for(pos : RoomPosition, type: BuildableStructureConstant) : boolean {
        return this.has_structure(pos, type) != null 
                || this.has_site(pos, type) != null 
                || this.has_running_task(pos, type) != null
                || this.has_queued_task(pos, type) != null;
    }

    has_structure(pos: RoomPosition, type: BuildableStructureConstant) : Structure {
        let found_structure = _.filter(pos.lookFor(LOOK_STRUCTURES), s => s.structureType == type);
        if (!found_structure) {
            return null;
        }
        return found_structure[0];
    }

    has_site(pos: RoomPosition, type: BuildableStructureConstant) : ConstructionSite {
        let found_site = _.filter(pos.lookFor(LOOK_CONSTRUCTION_SITES), s => s.structureType == type);
        if (!found_site) {
            return null;
        }
        return found_site[0];
    }

    has_running_task(pos: RoomPosition, type: BuildableStructureConstant) : BuildTask {
        let position : BuildPosition = {
            x: pos.x,
            y: pos.y,
            room_name: pos.roomName
        }
        let found_working_task = _.filter(this.running, t => t.pos == position && t.type == type);
        if (!found_working_task) {
            return null;
        }
        return found_working_task[0];
    }

    has_queued_task(pos: RoomPosition, type: BuildableStructureConstant) : BuildTask {
        let position : BuildPosition = {
            x: pos.x,
            y: pos.y,
            room_name: pos.roomName
        }
        let found_queued_task = _.filter(this.wait_queue, t => t.pos == position && t.type == type);
        if (!found_queued_task) {
            return null;
        }
        return found_queued_task[0];
    }    

    // Executes the logic for running a task currently in the build_list;
    run_task(task : BuildTask) {
        // check to see if the task is complete

    }


}