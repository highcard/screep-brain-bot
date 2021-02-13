/*

### Architecture

main.js
    #scheduler.mapeval.js  // map.evaluate.js  <== wip
    scheduler.roomlayout.js
        buildorder.queue
            buildorder.taskfactory.js
    scheduler.roomqueue.js
        buildorder.queue.js
            buildorder.taskfactory.js
        
    scheduler.creepcontrol.js
        scheduler.workqueue.js // refactor - this should not be peer to the brains. issue: brains don't have direct access

        brain.hauler.js
        brain.miner.js
        brain.worker.js



utils.debug
utils.once


 */