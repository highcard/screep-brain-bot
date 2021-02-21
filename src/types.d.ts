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


interface MineralRecord {
    id: Id<Mineral>;
    mineralType: MineralConstant;
    density: number;
}


interface Memory {
    BuildOrder: any; // TODO: SPECIFY
}

