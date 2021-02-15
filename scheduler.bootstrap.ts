const Debugger = require("utils.debug");
const debug = new Debugger("scheduler.bootstrap");

const BuildQueue = require("buildorder.queue");

module.exports = function(room) {

    const rcl_1 = [
        {
            name: "bootupworker",
            cmd: "bootupworker",
            room: room
        }
    ];
    const rcl_2 = [];
    const rcl_3 = [];
    const rcl_4 = [];
    const rcl_5 = [];

    this.run = function() {
        debug.log("Running bootstrap");
        debug.log(room);
        let queue = new BuildQueue();
        for (let cmd in rcl_1) {
            queue.addCmd(rcl_1[cmd]);
        }
        queue.run();
    }

    return this;
}