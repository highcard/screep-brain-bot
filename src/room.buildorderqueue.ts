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
            case "buildtest":
                build_command = ObjectiveBuildTest;
                console.log("registered buildtest")
                break;
            default:
                build_command = null;
        }
        return build_command;
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
