const Debugger = require("utils.debug");
const debug = new Debugger("scheduler.workqueue");

module.exports = function(room){
    
    // Initialize Memory

    const TASK_BUILDER = "builder";
    const TASK_CONTROLLER = "controller";
    const TASK_SPAWNER = "spawner";
    const TASK_REPAIR = "repairer";
    const TASK_WALLREPAIR = "wallrepair";

    let tasklist = [];

    const energyDeficitRatio = (room.energyCapacityAvailable - room.energyAvailable) / room.energyAvailable;
    const sites = room.find(FIND_MY_CONSTRUCTION_SITES);

    const structures = room.find(FIND_STRUCTURES, {
        filter: (s) => (s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART ) && (s.hits < s.hitsMax)
    })
    const walls = room.find(FIND_STRUCTURES, {
        filter: (s) => (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART ) && (s.hits < s.hitsMax)
    })
    const structureHitDeficit = _.sum(structures, s => (s.hitsMax - s.hits));
    const wallDeficitRatio = _.sum(walls, w => (w.hitsMax - w.hits)) / _.sum(walls, w => w.hitsMax);

    // RCL 1-2
    tasklist.push({
        task_type: TASK_SPAWNER,
        min_assign: energyDeficitRatio > 0 ? 1 : 0
    })

    tasklist.push({
        task_type: TASK_CONTROLLER,
        min_assign: 1
    });

    tasklist.push({
        task_type: TASK_SPAWNER,
        min_assign: energyDeficitRatio > .25 ? 2 : 0
    })

    tasklist.push({
        task_type: TASK_SPAWNER,
        min_assign: energyDeficitRatio > .5 ? 3 : 0 
    });    

    tasklist.push({
        task_type: TASK_CONTROLLER,
        min_assign: 2
    });

    tasklist.push({
        task_type: TASK_BUILDER,
        min_assign: Math.min(sites.length, 4)
    })

    tasklist.push({
        task_type: TASK_CONTROLLER,
        min_assign: 3
    });

    tasklist.push({
        task_type: TASK_REPAIR,
        min_assign: Math.ceil(structureHitDeficit / 200)
    })

    tasklist.push({
        task_type: TASK_SPAWNER,
        min_assign: energyDeficitRatio > .5 ? 4 : 0 
    })

    tasklist.push({
        task_type: TASK_CONTROLLER,
        min_assign: 5
    });

    // RCL 3

    tasklist.push({
        task_type: TASK_WALLREPAIR,
        min_assign: Math.ceil(walls.length / 20)
    });

    // CATCHALL TODO: Figureout better solution for upper bounds
    tasklist.push({
        task_type: TASK_CONTROLLER,
        min_assign: 50
    })


    this.get_next_task = function() {
        for (let t in tasklist) {
            let task = tasklist[t];
            if (task.assigned) {
                continue;
            }            
            let assigned = _.filter(Game.creeps, 
                (c) => c.memory.home_room == room.name 
                && c.memory.task == task.task_type);
            if (assigned.length >= task.min_assign) {
                task.assigned = true;
                continue;
            }
            return task.task_type;
        }
        debug.logError("no tasks available");
        return null;
    }

    return this;

}