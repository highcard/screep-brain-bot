import BuildQueue from "./room.buildorderqueue";

/// <reference path="./room.memory" />


export default class BootStrapDirector {

    room : Room;

    constructor(room : Room) {
        this.room = room;
    }

    run() {
        console.log("scheduler.bootstrap beginning of run()");

        let queue = new BuildQueue();

        // Always
        // Bootstrap Harvest/Filler if all creeps are dead
        let bootupworker_options : CommandOptions = {
            objective: "bootupworker"
        }
        queue.addCmd(this.room, bootupworker_options); // ALWAYS CHECKS

        // 
        // BEGIN RCL 1
        // Harvest/Filler
        // TODO

        // Miners
        for (let s in this.room.memory.sources) {
            let source_entry = this.room.memory.sources[s];
            console.log("directive.bootstrap queueing miners", source_entry);
            if (source_entry.container == null) {
                source_entry.container = source_entry.spots[0]; // figure this out later if important
            }
            let mining_options = {
                objective: "mining",
                source: source_entry
            }
            queue.addCmd(this.room, mining_options); // Miner builds own container
        }

        let upgrade_container = {
            objective: "upgrade_container"
        }

        queue.addCmd(this.room, upgrade_container);

        // for each source
            // check each sourceposition
        let build_container_options = {
            objective: "build_containers"
        }
        queue.addCmd(this.room, build_container_options);



        // Miner for each source
            // Miner#1 - mine and build container
                // Container ConstructionSite
            // Miner#2 - mine and build container
                // Container ConstructionSite

        // Upgrader Container Site
        // Extra Builders for each extra harvest site
            // Build the storage containers, then become upgraders
        // Build upgraders until at the max that can be supported at RCL1 mining





        // RCL 2
        // Ensure Miners
        // Ensure Filler
        // Ensure Haulers
        // Extensions ConstructionSites x5
        // Build tier1 workers until max that can be supported at RCL1 mining
        // One upgrader, rest build extensions.
        // Retask/recycle builders.
        // Replace Miners w/ Tier2 miner
        // Tier2 Dedicated Haulers
        // Tier2 Upgraders until at max supported

        // RCL 3

        // Ensure Miners
        // Ensure Filler
        // Extensions ConstructionSites x5
        // Build tier2 workers until max that can be supported at RCL2 mining
        // Recycle tier2 workers
        // 



        queue.run(this.room);
        console.log("scheduler.bootstarap after queue.run()");
    }

}