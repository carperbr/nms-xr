import { SceneNode } from "./SceneNode";

export abstract class SceneNodeAnimator {
    constructor() {

    }

    abstract update(node: SceneNode, delta: number);
}