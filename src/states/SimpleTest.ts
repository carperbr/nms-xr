import { State } from "../state";
import { SceneNode } from "../scene";
import { Renderer } from "../graphics/Renderer";
import { QuadBufferPC, QuadBufferPCT, Program, Shader, ShaderType, Texture } from "../graphics";
import { mat4, vec4, quat, vec3 } from "gl-matrix";
import gl from 'gl';

import * as BufferPC from "../graphics/shaders/BufferPC.glsl";
import * as BufferPCT from "../graphics/shaders/BufferPCT.glsl";
import { ServerEvent, ControlPose6DofInputEventData, HandGestureFlags, ControlTouchPadInputEventData } from "lumin";
import { App } from "../app";
import { CharBuffer } from "../graphics/CharBuffer";

export class SimpleTest extends State {
    bufferPC: Program;
    quadBufferPC: QuadBufferPC;

    bufferPCT: Program;
    quadBufferPCT: QuadBufferPCT;

    font: Texture;

    root: SceneNode;
    quad: SceneNode;
    quad2: SceneNode;
    controllerNode: SceneNode;
    texturedNode: SceneNode;

    delta: number;    
    offset: number;

    arialJson: any;
    charBuffer: CharBuffer;

    textTransform: mat4;

    constructor() {
        super("SimpleTest");
    }

    async init() {
        this.quadBufferPC = new QuadBufferPC();
        this.quadBufferPCT = new QuadBufferPCT();

        this.root = new SceneNode();

        this.quad = new SceneNode(this.root);
        this.quad.setPosition([0, 0, -4]);

        this.quad2 = new SceneNode(this.root);
        this.quad2.setPosition([-1, 0, -4]);
        this.quad2.color = vec4.fromValues(1, 1, 0, 1);

        this.controllerNode = new SceneNode(this.root);
        this.controllerNode.setScale([0.125, 0.125, 0.125]);
        this.controllerNode.color = vec4.fromValues(0, 1, 1, 1);
        this.offset = 0;

        this.texturedNode = new SceneNode(this.root);
        this.texturedNode.setPosition([1, 2, 3]);

        this.textTransform = mat4.create();
        mat4.translate(this.textTransform, this.textTransform, vec3.fromValues(0, 2, -2));

        let vsPC = new Shader(BufferPC.vs, ShaderType.Vertex);
        let fsPC = new Shader(BufferPC.fs, ShaderType.Fragment);
        this.bufferPC = new Program(vsPC, fsPC);

        let vsPCT = new Shader(BufferPCT.vs, ShaderType.Vertex);
        let fsPCT = new Shader(BufferPCT.fs, ShaderType.Fragment);
        this.bufferPCT = new Program(vsPCT, fsPCT);

        this.font = Texture.loadTexture("file://res/arial_0.png");
        this.charBuffer = new CharBuffer("file://res/arial.json");
    }

    async eventListener(event: ServerEvent) {
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
            let deltaOffset = -touch[1] * touch[2] * this.delta;
            this.offset += deltaOffset;
        }
    }

    async update(delta: number) {
        this.delta = delta;
    }

    async preDraw() {

    }

    async draw(eye: number, delta: number) {  
        let view = Renderer.instance.getViewMatrix(eye);
        let proj = Renderer.instance.getProjectionMatrix(eye);

        Renderer.instance.bindEyeFBO(eye);

        gl.clearColor(0, 0, 0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.bufferPC.use();
        gl.uniformMatrix4fv(1, false, view);
        gl.uniformMatrix4fv(2, false, proj);
        this.quadBufferPC.beginBatch();
        this.quadBufferPC.draw(this.quad, this.controllerNode, this.quad2);
        this.quadBufferPC.endBatch();

        this.bufferPCT.use();
        gl.uniformMatrix4fv(1, false, view);
        gl.uniformMatrix4fv(2, false, proj);
        gl.activeTexture(gl.TEXTURE0);
        this.font.bind();
        gl.uniform1i(3, 0);
        this.charBuffer.beginDraw();
        this.charBuffer.draw("Hello, world!", this.textTransform);
        this.charBuffer.endDraw();
    }

    async deInit() {

    }
}