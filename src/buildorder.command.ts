declare interface BuildCommand {
    cmd: string;
    satisfied: () => boolean;
    prereq: () => boolean;
    run: () => void;
}