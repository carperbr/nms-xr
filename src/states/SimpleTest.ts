import { State } from "../state";
import { SceneNode } from "../scene";
import { Renderer } from "../graphics/Renderer";
import { QuadBufferPC, Program, Shader, ShaderType } from "../graphics";
import { mat4, vec4, quat, vec3 } from "gl-matrix";
import gl from 'gl';

import * as BufferPC from "../graphics/shaders/BufferPC.glsl";
import { ServerEvent, ControlPose6DofInputEventData, HandGestureFlags, ControlTouchPadInputEventData } from "lumin";
import { App } from "../app";

export class SimpleTest extends State {
    bufferPC: Program;
    quadBuffer: QuadBufferPC;

    root: SceneNode;
    quad: SceneNode;
    controllerNode: SceneNode;

    delta: number;
    
    offset: number;

    constructor() {
        super("SimpleTest");
    }

    init(): void {
        this.quadBuffer = new QuadBufferPC();

        this.root = new SceneNode();

        this.quad = new SceneNode(this.root);
        this.quad.setPosition([0, 0, -4]);

        this.controllerNode = new SceneNode(this.root);
        this.controllerNode.setScale([0.125, 0.125, 0.125]);
        this.controllerNode.color = vec4.fromValues(0, 1, 1, 1);
        this.offset = 0;

        let vs = new Shader(BufferPC.vs, ShaderType.Vertex);
        let fs = new Shader(BufferPC.fs, ShaderType.Fragment);
        this.bufferPC = new Program(vs, fs);
    }

    eventListener(event: any) {
        if (event instanceof ControlPose6DofInputEventData) {            
            let rot = event.getQuaternion();
            this.controllerNode.rotation = quat.fromValues(rot[1], rot[2], rot[3], rot[0]);

            let controller = event.get6DofPosition();
            let pos = vec3.fromValues(0, 0, this.offset);
            vec3.transformQuat(pos, pos, this.controllerNode.rotation);
            vec3.add(pos, pos, controller);
            this.controllerNode.position = pos;
        } else if (event instanceof ControlTouchPadInputEventData) {
            let touch = event.getTouch();
            let deltaOffset = touch[1] * touch[2] * this.delta;
            this.offset += deltaOffset;
        }
    }

    update(delta: number) {
        this.delta = delta;
    }

    preDraw() {

    }

    draw(eye: number, delta: number) {  
        let view = Renderer.instance.getViewMatrix(eye);
        let proj = Renderer.instance.getProjectionMatrix(eye);

        Renderer.instance.bindEyeBuffer(eye);

        gl.clearColor(0, 0, 0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.bufferPC.use();

        gl.uniformMatrix4fv(0, false, mat4.create());
        gl.uniformMatrix4fv(1, false, view);
        gl.uniformMatrix4fv(2, false, proj);

        this.quadBuffer.beginBatch();
        this.quadBuffer.draw(this.quad, this.controllerNode);
        this.quadBuffer.endBatch();
    }

    deInit(): void {

    }
}