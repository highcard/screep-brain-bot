import {ObjectiveBootup} from "./objective.bootupworker";
import {ObjectiveMining} from "./objective.mining";
import {ObjectiveBuildTest} from "./objective.buildtest";
import {ObjectiveUpgradeContainer} from "./objective.upgradecontainer";

/// <reference path="./builorder.command" />


export default class BuildQueue {

    queue: Array<CommandOptions>; 

    constructor() {
        this.queue = [];
    }

    addCmd(room : Room, cmd : CommandOptions) {
        this.queue.push(cmd);
    }

    getDirective(cmd : CommandOptions) : BuildCommand {
        let build_command;
        switch(cmd.objective) {
            case "bootupworker":
                build_command = ObjectiveBootup;
                console.log("registred bootupworker");
                break;
            case "mining":
                build_command = ObjectiveMining;
                console.log("registered mining");
                break;
            case "upgrade_container":
                build_command = ObjectiveUpgradeContainer;
                console.log("registered upgrade_container");
                break;
            case "build_containers":
                build_command = null;
                console.log("NOOP - Registered build_containers");
                break
            case "buildtest":
                // build_command = ObjectiveBuildTest;
                console.log("registered buildtest")
                break;
            default:
                build_command = null;
                console.log("invalid command");
        }
        return build_command;
    }

    run(room : Room) {
        while (this.queue.length > 0) {
            let opts = this.queue.shift();
            let cmd : BuildCommand = this.getDirective(opts);
            if (!cmd) {
                continue;
            }
            if (cmd.satisfied(room, opts)) {
                continue;
            }
            if (cmd.prereq(room, opts)) {
                cmd.run(room, opts);
            } else {
                break;
            }
        }
    }
}
