// import modules

import * as Debugger from "./utils.debug";

import * as WorldMapControl from "./worldmap.director";
import * as RoomDirector from "./room.director";
import {cleanup_creeps} from "./memory.creeps";


module.exports.loop = function () {
    console.log(`====Running Tick:${Game.time}=====`);

    //let mapeval = new WorldMapControl();
    //mapeval.run();
    // BEGIN MEMORY CLEANUP -- Move this stuff elsewhere

    cleanup_creeps();

    console.log("hit_before_scan_visible_rooms");
    RoomDirector.scan_visible_rooms();
    console.log("hit_before_evaluate_all");
    RoomDirector.evaluate_all();
    console.log("hit_before_run_rooms");
    RoomDirector.run_rooms();
    console.log(`>>>> END OF MAIN: ${Game.time}`);
};