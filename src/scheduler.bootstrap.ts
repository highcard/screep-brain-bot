import BuildQueue from "./buildorder.queue";

export default class BootStrapDirector {

    room : Room;

    constructor(room : Room) {
        this.room = room;
    }

    run() {
        console.log("scheduler.bootstrap beginning of run()");
        // This should be moved out of run()
        let rcl_1 = [
            "bootupworker",
        ];
        // End move out of run();

        let queue = new BuildQueue();
        for (let cmd in rcl_1) {
            queue.addCmd(this.room, rcl_1[cmd]);
        }
        queue.run();
        console.log("scheduler.bootstarap after queue.run()");
    }

}