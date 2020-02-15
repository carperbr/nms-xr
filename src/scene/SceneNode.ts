import { vec3, quat, vec4, mat4 } from "gl-matrix"
import { NodeAnimator } from "./NodeAnimator";

export class SceneNode {
    position: vec3;
    rotation: quat;
    scale: vec3;

    color: vec4;
    colors: vec4[];

    parent: SceneNode;
    children: SceneNode[];

    animators: NodeAnimator[];

    constructor(parent?: SceneNode) {
        if (parent) {
            this.parent = parent;
            this.parent.addChild(this);
        }
        
        this.children = [];
        this.animators = [];

        this.position = vec3.fromValues(0, 0, 0);
        this.rotation = quat.create();
        this.scale = vec3.fromValues(1, 1, 1);
        this.color = vec4.fromValues(1, 1, 1, 1);
    }

    addChild(node: SceneNode) {
        this.children.push(node);
    }

    getRotation(): quat {
        let rotation = quat.copy(quat.create(), this.rotation);

        if (this.parent) {
            rotation  = quat.mul(rotation, this.parent.getRotation(), rotation);
        }

        return rotation;
    }

    getTransform(): mat4 {
        let transform = mat4.fromRotationTranslationScale(mat4.create(), this.rotation, this.position, this.scale);
        
        if (this.parent) {
            mat4.mul(transform, this.parent.getTransform(), transform);
        }
        
        return transform;
    }

    setPosition(pos: number[] | vec3) {
        vec3.set(this.position, pos[0], pos[1], pos[2]);
    }

    rotateX(angle: number) {
        quat.rotateX(this.rotation, this.rotation, angle);
    }

    rotateY(angle: number) {
        quat.rotateY(this.rotation, this.rotation, angle);
    }

    rotateZ(angle: number) {
        quat.rotateZ(this.rotation, this.rotation, angle);
    }

    setRotation(axis: number[] | vec3, angle: number) {
        quat.setAxisAngle(this.rotation, axis, angle);
    }

    setScale(scale: number[] | vec3) {
        vec3.set(this.scale, scale[0], scale[1], scale[2]);
    }

    update(delta: number) {
        for (let animator of this.animators) {
            animator.update(this, delta);
        }

        for (let child of this.children) {
            child.update(delta);
        }
    }
}