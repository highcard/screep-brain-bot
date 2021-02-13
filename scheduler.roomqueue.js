const Debugger = require("utils.debug");
const debug = new Debugger("scheduler.roomqueue");

const BuildOrderCmdQueue = require("buildorder.queue");

module.exports = function(room) {
    const q = new BuildOrderCmdQueue(room);

    const legacy = function() {
        q.addCmd({
            name: "bootup_workers",
            cmd: "bootup",
            room: room,
            role: "worker",
            num: 4
        });

        q.addCmd({
            name: "miners_1",
            cmd: "miners",
            room: room
        });

        q.addCmd({
            name: "haulers_1",
            cmd: "haulers",
            room: room
        })

        q.addCmd({
            name: "workers",
            cmd: "worker",
            room: room,
            role: "worker",
            num: 10
        });        
    }

    this.run = function() {
        legacy();
        q.run();
    }

}