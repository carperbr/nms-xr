import { SceneNode } from "./SceneNode";

export abstract class NodeAnimator {
    constructor() {

    }

    abstract update(node: SceneNode, delta: number);
}