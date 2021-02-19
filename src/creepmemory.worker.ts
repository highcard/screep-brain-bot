declare interface CreepMemory {
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

declare interface WorkerMemory extends CreepMemory {
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

function isWorkerMemory(x : CreepMemory): x is CreepMemory {
    return (x as CreepMemory).target !== undefined 
        && (x as CreepMemory).idle !== undefined
        && (x as CreepMemory).task !== undefined
}