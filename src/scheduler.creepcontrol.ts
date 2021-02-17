import { BrainWorker } from "./brain.worker";
import { BrainMiner } from './brain.miner';


export default class CreepControl {

    room : Room;
    scheduler : any; //  TODO: Fix This

    constructor(room: Room) {
        this.room = room;
    }


    run() {
        console.log("begin creepcontrol.run()");
        // Run creep behaviors for all creeps controlled by room Scheduler
        let creeps = _.filter(Game.creeps, (c) => !c.spawning && c.memory.home_room == this.room.name);
        for (let c in creeps) {
            // Get current Creep 
            let creep = creeps[c];
            if (creep == null) {
                continue;
            }
            let creep_brain;
            // Set CreepBrain
            let found = true;
            console.log("creepcontrol.run() before switch");
            switch(creep.memory.role) {
                case "worker":          
                    creep_brain = new BrainWorker(creep);
                    break;
                case "miner":
                    creep_brain = new BrainMiner(creep);
                    break;
                case "hauler":
                    // NOT IMPLEMENTED
                    // creep_brain = new BrainHauler(creep);
                    break;
                default:
                    found = false;
            }
            console.log("creepcontrol.run() after switch");            
            // Run creepbrain for assigned role
            if (found) {
                console.log("creepcontrol.run() before creep_brain.run()");
                creep_brain.run();
            }
        }
        console.log("end creepcontrol.run()"); 
    }
}