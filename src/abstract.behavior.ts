abstract class CreepBehavior {

    creep: Creep;

    constructor(creep : Creep) {
        this.creep = creep;
    }

    abstract get_target() : any;

    abstract run() : boolean;

}

export {CreepBehavior};