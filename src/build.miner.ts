import CreepFactory from "./creep.factory";

class BO_Miner implements BuildCommand {

    cmd : string;
    role : string;
    room : Room;

    constructor(room : Room, cmd : string) {
        this.role = "miner";
        this.cmd = cmd;
        this.room = room;
    }

    satisfied() : boolean {
        let buildNum = this.room.find(FIND_SOURCES).length;        
        let curRoleCreeps = _.filter(Game.creeps, function(c) {
            return c.memory.role == this.role && c.memory.home_room == this.room.name
        });
        return curRoleCreeps.length >= buildNum;
    }
    
    prereq() : boolean {
        let energy = this.room.energyAvailable;
        let energy_min = 550; // TODO: THIS IS A HACK. FIX IT.
        return energy >= energy_min;
    }
    
    run() {
        let memory = {
                get_target: null, 
                put_target: null,
                task: null,
                idle: true
        }
        CreepFactory.build_creep(
            this.room,
            this.role,
            this.room.energyAvailable,
            memory
        );
    }

};

export {BO_Miner};