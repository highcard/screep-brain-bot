import {BO_BootupWorker} from "./build.bootupworker";

export default class BuildQueue {

    queue: Array<BuildCommand>; 

    constructor() {
        this.queue = [];
    }

    addCmd(room : Room, cmd : string) {
        console.log("buildorder.queue before addCmd");
        let build_command;
        switch(cmd) {
            case "bootupworker":
                build_command = new BO_BootupWorker(room, cmd);
                break;
            default:
                build_command = null;
            }
        if (build_command == null) {
            return;
        }
        this.queue.push(build_command);
    }

    run() {
        while (this.queue.length > 0) {
            let cmd = this.queue.shift();
            console.log("buildorder.queue before cmd.satisfied()");
            if (cmd.satisfied()) {
                continue;
            }
            console.log("buildorder.queue before cmd.prereq()");
            if (cmd.prereq()) {
                console.log("buildorder.queue before cmd.run()");
                cmd.run();
            } else {
                break;
            }
        }
    }
}
