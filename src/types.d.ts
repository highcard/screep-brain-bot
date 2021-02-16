type FillTarget = StructureSpawn | StructureExtension;
type ContainerTarget = StructureContainer | StructureStorage;
type RepairTarget = Structure;
type WallRepairTarget = StructureWall | StructureRampart;

type GatherTarget = Source | ContainerTarget | Tombstone | Resource;

declare const TASK_BUILDER = "builder";
declare const TASK_CONTROLLER = "controller";
declare const TASK_SPAWNER = "spawner";
declare const TASK_REPAIR = "repairer";
declare const TASK_WALLREPAIR = "wallrepair";
declare const TASK_CONTAINER = "container";

type WorkType = typeof TASK_BUILDER
            | typeof TASK_CONTROLLER
            | typeof TASK_SPAWNER
            | typeof TASK_REPAIR
            | typeof TASK_WALLREPAIR
            | typeof TASK_CONTAINER;

declare const TARGET_SOURCE = 1;
declare const TARGET_CONTAINER = 2;
declare const TARGET_DROPPED = 3;
declare const TARGET_TOMB = 4;

type GatherType = typeof TARGET_SOURCE;

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

interface MinerMemory extends WorkerMemory {
    target: {
        mine: Id<Source>;
        build: Id<ConstructionSite>;
        repair: Id<RepairTarget>;
        haul: Id<ContainerTarget>;
    }
}

interface BuildCommand {
    cmd: string;
    satisfied: () => boolean;
    prereq: () => boolean;
    run: () => void;
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

