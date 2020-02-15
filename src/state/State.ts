import { ServerEvent } from "lumin";

export abstract class State {
    constructor(public name: string) {}
    abstract init(): void;
    abstract eventListener(event: ServerEvent): void;
    abstract update(delta: number): void;
    abstract draw(eye: number, delta: number): void;
    abstract deInit(): void;

    // Used for cases where rendering is eye-agnostic, ie textured quads
    preDraw(delta: number): void { }
}