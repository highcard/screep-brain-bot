// import modules

import * as Debugger from "./utils.debug";

import * as WorldMapControl from "./map.evaluate";
import * as RoomDirector from "./memory.scanroom";
import {cleanup_creeps} from "./memory.creeps";


module.exports.loop = function () {
    console.log(`====Running Tick:${Game.time}=====`);

    //let mapeval = new WorldMapControl();
    //mapeval.run();
    // BEGIN MEMORY CLEANUP -- Move this stuff elsewhere

    cleanup_creeps();

    RoomDirector.scan_visible_rooms();
    RoomDirector.evaluate_all();
    RoomDirector.run_rooms();

};