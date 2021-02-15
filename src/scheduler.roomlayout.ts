const Debugger = require("utils.debug");
const debug = new Debugger("scheduler.roomlayout");

const BuildOrderCmdQueue = require("buildorder.queue");

module.exports = function(room) {
    const q = new BuildOrderCmdQueue(room);

    this.run = function() {
        debug.logInfo(`BEGIN QUEUEING BUILD ORDER`, room.name)
        q.addCmd({
            name: "energy_path",
            cmd: "energy_path",
            room: room
        });

        q.addCmd({
            name: "ext_rcl_2",
            cmd: "extensions",
            rcl: 2,
            quantity: 5,
            room: room
        });

        q.addCmd({
            name: "ext_rcl_3",
            cmd: "extensions",
            rcl: 3,
            quantity: 10,
            room: room
        });

        q.addCmd({
            name: "ext_rcl_4",
            cmd: "extensions",
            rcl: 4,
            quantity: 20,
            room: room
        });
        
        q.addCmd({
            name: "mining_containers",
            cmd: "mine_containers",
            room: room
        });
        q.run();
    }

}