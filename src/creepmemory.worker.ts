declare interface CreepMemory {
    role?: string;
    home_room?: string;
    working?: boolean;
    idle?: boolean;
    task?: {
        type: WorkType;
        id: string;
    }
    target?: {
        [key: string]: Id<RoomObject>;
    };
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