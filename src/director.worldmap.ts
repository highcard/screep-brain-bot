import {Debugger} from "./utils.debug";

module.exports = function () {

    const memroot = "_worldeval";

    this.evaluate_room = function (room_name, num) {
        Memory[memroot].rooms[room_name] = Memory[memroot].rooms[room_name] || {};
        let mem = Memory[memroot].rooms[room_name];
        let room = Game.rooms[room_name];

        if (room && room.controller.my) {
            Game.map.visual.circle(new RoomPosition(25, 25, room_name), {fill: "#158503", radius: 20});
        }
        Game.map.visual.text(num, new RoomPosition(25, 25, room_name), {fontSize: 20});

    }

    this.mem_init = function () {
        Memory[memroot] = Memory[memroot] || {};
        Memory[memroot].rooms = Memory[memroot].rooms || {};
    }

    this.run = function() {
        this.mem_init();
        if (!Memory[memroot].rootroom) {
            let my_rooms = _.filter(Game.rooms, r => r.controller.my == true);
            if (my_rooms.length == 0) {
                console.log("[map.eval] no rooms");
                return;
            }
            Memory[memroot].rootroom = my_rooms.sort((a,b) => b.controller.level - a.controller.level)[0].name;
        }

        const map = Game.map;
        let room_queue = [];
        let seen = {};
        let max = 20;
        let i = 0;
        room_queue.push(Memory[memroot].rootroom);

        while(room_queue.length && i < max) {
            let cur_room = room_queue.shift();
            seen[cur_room] = true;
            this.evaluate_room(cur_room, i);
            let exits = Game.map.describeExits(cur_room);
            for (let e in exits) {
                let exit = exits[e];
                if (seen[exit] == true) {
                    continue;
                }
                seen[exit] = true;                
                room_queue.push(exit);
            }
            i++;
        }
    }



    return this;

}