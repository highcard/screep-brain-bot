import {taskfactory} from "./buildorder.taskfactory";

export default class BuildQueue {

    queue: Array<BuildCommand>; 

    constructor() {
        this.queue = [];
    }

    addCmd(room : Room, cmd : string) {
        let build_command = taskfactory(room, cmd);
        this.queue.push(build_command);
    }

    run() {
        while (this.queue.length > 0) {
            let cmd = this.queue.shift();
            if (cmd.satisfied()) {
                continue;
            }
            if (cmd.prereq()) {
                cmd.run();
            } else {
                break;
            }
        }
    }
}
