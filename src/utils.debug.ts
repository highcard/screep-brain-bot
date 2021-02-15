module.exports = function(filename) {
    const DEBUG_MEMROOT = "_debug"
    const DEBUG_PROFILE = "foobar";
    
    const CTRL_KEYWORD = "ctrl"
    
    const LOG_ERROR = "log_error";
    const LOG_INFO = "log_info";

    this.log = function(s, context) {
        console.log(`[${filename}]${context ? "[" + context + "]" : ""} ${s}`);
    }

    this.logError = function(s, context) {
        if (Memory[DEBUG_MEMROOT][DEBUG_PROFILE][filename][LOG_ERROR] == true) {
            this.log(s, context);
        }
    }

    this.logInfo = function(s, context) {
        if (Memory[DEBUG_MEMROOT][DEBUG_PROFILE][filename][LOG_INFO] == true) {
            this.log(s, context);
        }
    }

    this.mem_init = function () {
        if (Memory[DEBUG_MEMROOT] == undefined) {
            Memory[DEBUG_MEMROOT] = {
                [CTRL_KEYWORD] : ""
            }
        }
        if (Memory[DEBUG_MEMROOT][DEBUG_PROFILE] == undefined) {
            Memory[DEBUG_MEMROOT][DEBUG_PROFILE] = {};
        }
        if (Memory[DEBUG_MEMROOT][DEBUG_PROFILE][filename] == undefined) {
            Memory[DEBUG_MEMROOT][DEBUG_PROFILE][filename] = {
            id: filename,
            [LOG_ERROR]: true,
            [LOG_INFO]: true
            }
        }
    }

    this.set_all = function(key, val) {
        console.log(`[DEBUG CTRL] Setting ${key} to ${val}`);
        for (let file in Memory[DEBUG_MEMROOT][DEBUG_PROFILE]) {
            Memory[DEBUG_MEMROOT][DEBUG_PROFILE][file][key] = val;
        }
    }

    this.parse_control = function() {
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
    this.mem_init();
    this.parse_control();
    return this;
}