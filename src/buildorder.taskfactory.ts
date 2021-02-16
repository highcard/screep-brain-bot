import {BO_BootupWorker} from "./build.bootupworker";

const taskfactory = function(room : Room, cmd : string) {
    let build_command;
    switch(cmd) {
        case "bootupworker":
            build_command = new BO_BootupWorker(room, cmd);
            break;
        default:
            build_command = null;
        }
    return build_command;
};

export {taskfactory};