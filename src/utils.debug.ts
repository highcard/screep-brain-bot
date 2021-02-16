const DEBUG_MEMROOT = "_debug"
const DEBUG_PROFILE = "foobar";

const CTRL_KEYWORD = "ctrl"

const LOG_ERROR = "log_error";
const LOG_INFO = "log_info";

class Debugger {

    filename : string;

    constructor(filename: string) {
        this.filename = filename;
        this.mem_init();
        this.parse_control();
    }

    log(s : string, context? : string) {
        console.log(`[${this.filename}]${context ? "[" + context + "]" : ""} ${s}`);
    }

    logError(s : string, context? : string) {
        if (Memory[DEBUG_MEMROOT][DEBUG_PROFILE][this.filename][LOG_ERROR] == true) {
            this.log(s, context);
        }
    }

    logInfo(s : string, context? : string) {
        if (Memory[DEBUG_MEMROOT][DEBUG_PROFILE][this.filename][LOG_INFO] == true) {
            this.log(s, context);
        }
    }

    mem_init() {
        if (Memory[DEBUG_MEMROOT] == undefined) {
            Memory[DEBUG_MEMROOT] = {
                [CTRL_KEYWORD] : ""
            }
        }
        if (Memory[DEBUG_MEMROOT][DEBUG_PROFILE] == undefined) {
            Memory[DEBUG_MEMROOT][DEBUG_PROFILE] = {};
        }
        if (Memory[DEBUG_MEMROOT][DEBUG_PROFILE][this.filename] == undefined) {
            Memory[DEBUG_MEMROOT][DEBUG_PROFILE][this.filename] = {
            id: this.filename,
            [LOG_ERROR]: true,
            [LOG_INFO]: true
            }
        }
    }

    set_all(key : string, val : boolean ) {
        console.log(`[DEBUG CTRL] Setting ${key} to ${val}`);
        for (let file in Memory[DEBUG_MEMROOT][DEBUG_PROFILE]) {
            Memory[DEBUG_MEMROOT][DEBUG_PROFILE][file][key] = val;
        }
    }

    parse_control() {
        if (Memory[DEBUG_MEMROOT][CTRL_KEYWORD] != "") {
            switch(Memory[DEBUG_MEMROOT][CTRL_KEYWORD]) {
                case "log_errors_on":
                    this.set_all(LOG_ERROR, true);
                    break;
                case "log_errors_off":
                    this.set_all(LOG_ERROR, false);
                    break;
                case "log_info_on":
                    this.set_all(LOG_INFO, true);
                    break;
                case "log_info_off":
                    this.set_all(LOG_INFO, false);
                    break;
                default:
                    break;
            }                
            Memory[DEBUG_MEMROOT][CTRL_KEYWORD] = "";
        }
    }
}

export { Debugger };