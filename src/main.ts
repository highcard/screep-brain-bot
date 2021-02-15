// import modules

const Debugger = require("utils.debug");
const debug = new Debugger("main");

const SchedSpawnControl = require("scheduler.roomqueue");
const SchedLayoutControl = require("scheduler.roomlayout");


const WorldMapControl = require("map.evaluate");
const RoomMemory = require("memory.scanroom");
const CreepMemory = require("memory.creeps");

module.exports.loop = function () {

    debug.logInfo("============");

    //let mapeval = new WorldMapControl();
    //mapeval.run();
    // BEGIN MEMORY CLEANUP -- Move this stuff elsewhere

    let roomscanner = new RoomMemory();
    let creepcleanup = new CreepMemory();


    creepcleanup.cleanup();

    roomscanner.scan_visible_rooms();
    roomscanner.evaluate_all();
    roomscanner.run_rooms();



};