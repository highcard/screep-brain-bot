declare interface HarvestSpot {
    x: number;
    y: number;
}

declare interface SourceEntry {
    id: Id<Source>;
    spots: Array<HarvestSpot>;
    container: HarvestSpot;
}

declare interface ControllerEntry {
    id: Id<StructureController>;
    container: HarvestSpot;
}

declare interface RoomMemory {
    directing?: boolean;
    directive?: number; // UPDATE THIS WITH TYPE CONSTANTS
    spawns?: Array<Id<StructureSpawn>>;
    my?: boolean;
    owner?: string;
    controller?: ControllerEntry;
    minerals?: Array<MineralRecord>;
    sources?: Array<SourceEntry>;
}