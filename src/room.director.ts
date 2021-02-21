import CreepControl from "./scheduler.creepcontrol";
import BootstrapDirector from "./directive.bootstrap";
import {EnergyDirector} from "./energy.manager";

/// <reference path="./room.memory" />

    // Room Memory Init <== Consider moving this elsewhere.

const DIR_NONE = 0;
const DIR_BOOTSTRAP = 1;
const DIR_RESERVE = 2;
const DIR_COLONIZE = 3;

/*
*
*
*
*
*
*
*/

function scan_visible_rooms() {
    Memory.rooms = Memory.rooms || {};
    // for (let roomKey in Game.rooms) {
    //     scan_room(roomkey);
    // }
    if (Game.rooms["sim"] != undefined) {
        scan_room("sim", true);
    }
}

function scan_room(room_name : string, reset=false) {
    let room = Game.rooms[room_name];
    if (!room) {
        return;
    }

    scan_sources(room, reset);

    scan_minerals(room, reset);

    scan_controller(room, reset);

    scan_spawns(room, reset);

    scan_owner(room, reset);

}

function scan_sources(room : Room, reset : boolean = false) {
    if (reset || room.memory.sources == undefined) {
        room.memory.sources = [] as Array<SourceEntry>;
        let source_mem : Array<SourceEntry> = [];
        let sources = room.find(FIND_SOURCES);
        for (let s in sources) {
            let source_memory_entry : SourceEntry = {
                id: sources[s].id,
                spots: [],
                container: null
            }
            let harvest_spots : Array<HarvestSpot> = get_harvest_spots(sources[s]);
            for (let spot in harvest_spots) {
                source_memory_entry.spots.push({
                    x: harvest_spots[spot].x, 
                    y: harvest_spots[spot].y
                });
            }
            room.memory.sources.push(source_memory_entry);
        }
    }    
}

function scan_minerals(room : Room, reset : boolean = false) {
    if (reset || room.memory.minerals == undefined) {
        room.memory.minerals = [];
        let minerals = room.find(FIND_MINERALS);
        for (let m in minerals) {
            let mineral = minerals[m];
            room.memory.minerals.push({
                id: mineral.id,
                mineralType: mineral.mineralType,
                density: mineral.density
            })
        }
    }    
}

function scan_controller(room : Room, reset : boolean = false) {
    let rv = new RoomVisual(room.name);
    if (reset || room.memory.controller == undefined) {
        if (!room.controller) {
            room.memory.controller = null;
            return;
        }
        room.memory.controller = {
            id: room.controller.id,
            container: null
        };
        let upgrade_spots : Array<HarvestSpot> = get_controller_container_spots(room.controller);
        let best_spot: RoomPosition = null;
        let best_cost: number = Infinity;
        for (let s in upgrade_spots) {
            let pos = new RoomPosition(upgrade_spots[s].x, upgrade_spots[s].y, room.name);
            let cur_spot = upgrade_spots[s];
            let cur_cost = 0;
            for (let s in room.memory.sources) {
                let source_entry = room.memory.sources[s];
                let source_container = new RoomPosition(source_entry.container.x, source_entry.container.y, room.name);
                cur_cost += PathFinder.search(pos, source_container).cost;
            }
            if (cur_cost < best_cost) {
                best_spot = pos;
            }
        }
        if (best_spot) {
            rv.circle(best_spot, {fill: "#66ccff"})
            room.memory.controller.container = {
                x: best_spot.x,
                y: best_spot.y
            }
        } else {
            console.log("room.director scan_controller failed");
        }
    }
}

function scan_spawns(room : Room, reset : boolean = false) {
    if (reset || room.memory.spawns == undefined || room.memory.spawns.length == 0) {
        room.memory.spawns = [];
        let spawns = room.find(FIND_MY_SPAWNS);
        for (let s in spawns) {
            room.memory.spawns.push(spawns[s].id);
        }
    }
}

function scan_owner(room : Room, reset : boolean = false) {
    if (reset || room.memory.my == undefined) {
        room.memory.my = room.controller ? room.controller.my : false;
    }   
    if (reset || room.memory.owner == undefined) {
        room.memory.owner = room.controller ? room.controller.owner.username : null;
    }    
}


function get_harvest_spots(source : Source) : Array<HarvestSpot> {
    let rv = new RoomVisual(source.room.name);
    let terrain = source.room.getTerrain();
    let variance = [-1, 0, 1];
    let sites = [];
    for (let x in variance) {
        for (let y in variance) {
            let cur_x = source.pos.x + variance[x];
            let cur_y = source.pos.y + variance[y];
            if (terrain.get(cur_x, cur_y) != TERRAIN_MASK_WALL) {
                let cur_pos = new RoomPosition(cur_x, cur_y, source.room.name)
                rv.circle(cur_pos, {fill: "#ccc"})
                sites.push(cur_pos);
            }
        }
    }
    return sites;
}

function get_controller_container_spots(controller : StructureController) {
    let rv = new RoomVisual(controller.room.name);
    let terrain = controller.room.getTerrain();
    let variance = [-1, 0, 1];
    let sites = [];
    for (let x in variance) {
        for (let y in variance) {
            let cur_x = controller.pos.x + variance[x];
            let cur_y = controller.pos.y + variance[y];
            if (terrain.get(cur_x, cur_y) != TERRAIN_MASK_WALL) {
                let cur_pos = new RoomPosition(cur_x, cur_y, controller.room.name)
                rv.circle(cur_pos, {fill: "#ccc"})
                sites.push(cur_pos);
            }
        }
    }
    return sites;
}


/*
*
*
*
*
*
*
*/

function evaluate_all() {
    for (let room in Memory.rooms) {
        evaluate_room(room);
    }
}

function evaluate_room(room) {
    let directive;
    if (!Memory.rooms[room].directing) {
        Memory.rooms[room].directing = Memory.rooms[room].my;
    }
    if (Memory.rooms[room] && Memory.rooms[room].directing) {
        let spawnnum = Memory.rooms[room].spawns.length;
        if (spawnnum > 0) {
            directive = DIR_BOOTSTRAP;
        } else {
            directive = DIR_RESERVE;
        }
        Memory.rooms[room].directive = directive;
    }
}

/*
*
*
*
*
*
*
*/

function run_rooms() {
    console.log("begin run_rooms");
    for (let room in Memory.rooms) {
        console.log(room);
        if (Memory.rooms[room].directing) {
            let creepcontrol;
            let director;
            let energydirector;
            console.log("before switch");
            switch (Memory.rooms[room].directive) {
                case DIR_NONE:
                    // do nothing
                    break;
                case DIR_BOOTSTRAP:
                    director = new BootstrapDirector(Game.rooms[room]);
                    energydirector = new EnergyDirector(Game.rooms[room]);
                    creepcontrol = new CreepControl(Game.rooms[room]);
                    break;
                case DIR_RESERVE:
                    break;
                case DIR_COLONIZE:
                    break;
            }
            console.log("before director.run()");
            if (director) director.run();
            console.log("before energydirector.run()");
             if (energydirector) energydirector.run();
            console.log("before creepcontrol.run()");
            if (creepcontrol) creepcontrol.run();
        }
    }
    console.log("end of run_rooms()");    
}

export {
    scan_visible_rooms,
    evaluate_all,
    run_rooms
}