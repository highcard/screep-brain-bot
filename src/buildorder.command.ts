declare interface BuildCommand {
    satisfied: (room: Room, cmd : CommandOptions) => boolean;
    prereq: (room: Room, cmd : CommandOptions) => boolean;
    run: (room: Room, cmd : CommandOptions) => void;
}


interface CommandOptions {
    objective: string;
    [key: string]: any;
}
