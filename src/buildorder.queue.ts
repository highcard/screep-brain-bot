import {ObjectiveBootup} from "./objective.bootupworker";
import {ObjectiveMining} from "./objective.mining";

export default class BuildQueue {

    queue: Array<BuildCommand>; 

    constructor() {
        this.queue = [];
    }

    addCmd(room : Room, cmd : string) {
        let build_command;
        switch(cmd) {
            case "bootupworker":
                build_command = new ObjectiveBootup(room, cmd);
                break;
            case "mining":
                build_command = new ObjectiveMining(room, cmd);
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
