function cleanup_creeps() {
    for (let memCreepKey in Memory.creeps) {
        if(Game.creeps[memCreepKey] == undefined) {
            Memory.creeps[memCreepKey] = undefined;
        }
    }          
}

export {
    cleanup_creeps
}