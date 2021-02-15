module.exports = function() {
    
    this.cleanup = function() {
        for (let memCreepKey in Memory.creeps) {
            if(Game.creeps[memCreepKey] == undefined) {
                Memory.creeps[memCreepKey] = undefined;
            }
        }          
    }
  
    return this

};
