import { vec3, quat, vec4, mat4 } from "gl-matrix";

export class Node {
    position: vec3;
    rotation: quat;
    scale: vec3;
    color: vec4;

    parent: Node;
    children: Node[];

    constructor(parent?: Node) {
        this.parent = parent ? parent : this;
        this.children = [];

        this.position = vec3.fromValues(0, 0, 0);
        this.rotation = quat.create();
        quat.fromEuler(this.rotation, 0, 0, 0);
        this.scale = vec3.fromValues(2, 2, 2);
        this.color = vec4.fromValues(1, 1, 1, 1);
    }

    addChild(node: Node) {
        this.children.push(node);
    }

    getTransform(): mat4 {
        let transform = mat4.create();
        mat4.fromRotationTranslationScale(transform, this.rotation, this.position, this.scale);
        return transform;
    }

    setPosition(pos: number[]) {
        vec3.set(this.position, pos[0], pos[1], pos[2]);
    }
}