

type FillTarget = StructureSpawn | StructureExtension;
type ContainerTarget = StructureContainer | StructureStorage;
type RepairTarget = Structure;
type WallRepairTarget = StructureWall | StructureRampart;

type GatherTarget = Source | ContainerTarget | Tombstone | Resource;


// Worker tasks for the PUT (energy-out) actions]

declare const GETTARGET_SOURCE = 1;
declare const GETTARGET_CONTAINER = 2;
declare const GETTARGET_DROPPED = 3;
declare const GETTARGET_TOMB = 4;

declare const PUTTARGET_FILL = 1;
declare const PUTTARGET_BUILD = 2;
declare const PUTTARGET_UPGRADE = 3;
declare const PUTTARGET_CONTAINER = 4;
declare const PUTTARGET_REPAIR = 5;
declare const PUTTARGET_WALLREPAIR = 6;

type WorkType = typeof PUTTARGET_FILL
            | typeof PUTTARGET_BUILD
            | typeof PUTTARGET_UPGRADE
            | typeof PUTTARGET_CONTAINER
            | typeof PUTTARGET_REPAIR
            | typeof PUTTARGET_WALLREPAIR;

// Worker GET (energy-in) actions

type GatherType = typeof GETTARGET_SOURCE;

interface CreepMemory {
    role?: string;
    home_room?: string;
    working?: boolean;
    idle?: boolean;
    task?: {
        type: WorkType;
        id: string;
    }
    target?: object;
}

interface WorkerMemory extends CreepMemory {
    role: string;
    home_room: string;
    working: boolean;
    idle: boolean;
    task: {
        type: WorkType;
        id: string;
    };
    target: {
        mine?: Id<Source>;
        build?: Id<ConstructionSite>;
        upgrade?: Id<StructureController>;
        fill?: Id<FillTarget>;
        repair?: Id<RepairTarget>;
        wallrepair?: Id<WallRepairTarget>;
        withdraw?: Id<ContainerTarget>;
        haul?: Id<ContainerTarget>;
    }
}

interface HarvestMemory extends WorkerMemory {
    target: {
        mine: Id<Source>;
    }
}

interface FillMemory extends WorkerMemory {
    target: {
        fill: Id<FillTarget>;
    }
}

interface BuildMemory extends WorkerMemory {
    target: {
        build: Id<ConstructionSite>;
    };
}

interface WithdrawMemory extends WorkerMemory {
    target: {
        withdraw: Id<ContainerTarget>;
    }
}

interface UpgradeMemory extends WorkerMemory {
    target: {
        upgrade: Id<StructureController>;
    };
}

interface RepairMemory extends WorkerMemory {
    target: {
        repair: Id<RepairTarget>;
    };
}

interface HaulMemory extends WorkerMemory {
    target: {
        haul: Id<ContainerTarget>;
    };
}

interface WallRepairMemory extends WorkerMemory {
    target: {
        wallrepair: Id<WallRepairTarget>;
    }
}




interface MineralRecord {
    id: Id<Mineral>;
    mineralType: MineralConstant;
    density: number;
}

interface RoomMemory {
    directing?: boolean;
    directive?: number; // UPDATE THIS WITH TYPE CONSTANTS
    spawns?: Array<Id<StructureSpawn>>;
    my?: boolean;
    owner?: string;
    controller?: Id<StructureController>;
    minerals?: Array<MineralRecord>;
    sources?: Array<string>;
}

interface Memory {
    BuildOrder: any; // TODO: SPECIFY
}

