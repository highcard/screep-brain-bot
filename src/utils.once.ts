import { Debugger } from "./utils.debug";

module.exports = function(filename) {
    let debug = new Debugger("utils.once");
    const memroot = "once";

    this.mem_init = function () {
        Memory[memroot] = Memory[memroot] || {};
        if (Memory[memroot][filename != false]) {
            Memory[memroot][filename] = true;
        }
    }

    this.run = function(x) {
        this.mem_init();
        if (Memory[memroot][filename] == true) {
            Memory[memroot][filename] = false;
            x();
            debug.logInfo(`Ran Once`, filename)
        }
    }
    return this;
}