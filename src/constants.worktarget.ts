

export const GETTARGET_SOURCE = 1;
export const GETTARGET_CONTAINER = 2;
export const GETTARGET_DROPPED = 3;
export const GETTARGET_TOMB = 4;

export const PUTTARGET_FILL = 1;
export const PUTTARGET_BUILD = 2;
export const PUTTARGET_UPGRADE = 3;
export const PUTTARGET_CONTAINER = 4;
export const PUTTARGET_REPAIR = 5;
export const PUTTARGET_WALLREPAIR = 6;

export const default_workermemory = {
    role: null,
    home_room: null,
    working: false,
    idle: true,
    task: {
        type: null,
        id: null,
    },
    target: {
        mine: null,
        build: null,
        upgrade: null,
        fill: null,
        repair: null,
        wallrepair: null,
        withdraw: null,
        haul: null,
    }
}

export const default_minermemory = {
    role: null,
    home_room: null,
    working: false,
    idle: true,
    task: {
        type: null,
        id: null,
    },
    target: {
        mine: null,
        build: null,
        repair: null,
        haul: null,
    }
}