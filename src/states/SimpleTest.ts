import { State } from "../state";
import { SceneNode } from "../scene";
import { Renderer } from "../graphics/Renderer";
import { QuadBufferPC, Program, Shader, ShaderType } from "../graphics";
import { mat4 } from "gl-matrix";
import gl from 'gl';

import * as BufferPC from "../graphics/shaders/BufferPC.glsl";
import { ServerEvent } from "lumin";

export class SimpleTest extends State {
    bufferPC: Program;
    quadBuffer: QuadBufferPC;
    quad: SceneNode;

    constructor() {
        super("SimpleTest");
    }

    init(): void {
        this.quadBuffer = new QuadBufferPC();
        this.quad = new SceneNode();
        this.quad.setPosition([0, 0, -4]);

        let vs = new Shader(BufferPC.vs, ShaderType.Vertex);
        let fs = new Shader(BufferPC.fs, ShaderType.Fragment);
        this.bufferPC = new Program(vs, fs);
    }

    eventListener(event: ServerEvent) {

    }

    update(delta: number) {
        
    }

    draw(eye: number, delta: number) {  
        let view = Renderer.instance.getViewMatrix(eye);
        let proj = Renderer.instance.getProjectionMatrix(eye);

        Renderer.instance.bindEyeBuffer(eye);

        this.bufferPC.use();

        gl.uniformMatrix4fv(0, false, mat4.create());
        gl.uniformMatrix4fv(1, false, view);
        gl.uniformMatrix4fv(2, false, proj);

        this.quadBuffer.beginBatch();
        this.quadBuffer.draw(this.quad);
        this.quadBuffer.endBatch();
    }

    deInit(): void {

    }
}