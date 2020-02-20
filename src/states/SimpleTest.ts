import { State } from "../state";
import { SceneNode } from "../scene";
import { Renderer } from "../graphics/Renderer";
import { QuadBufferPC, QuadBufferPCT, Program, Shader, ShaderType, Texture } from "../graphics";
import { mat4, vec4, quat, vec3 } from "gl-matrix";
import gl, { COLOR_ATTACHMENT4, FLOAT_MAT4x3 } from 'gl';

import * as BufferPC from "../graphics/shaders/BufferPC.glsl";
import * as BufferPCT from "../graphics/shaders/BufferPCT.glsl";
import { ServerEvent, ControlPose6DofInputEventData, HandGestureFlags, ControlTouchPadInputEventData, EyeTrackingEventData } from "lumin";
import { App } from "../app";
import { CharBuffer } from "../graphics/CharBuffer";

import * as integration from "../math";
import { Framebuffer } from "../graphics/Framebuffer";

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
    integrator: integration.Integrator;

    spaceFBO: Framebuffer;
    spaceDiffuse: Texture;
    spaceDepth: Texture;

    spaceWindowPortal: SceneNode;
    spaceCamera: SceneNode;
    spaceQuad: SceneNode;
    spaceQuad2: SceneNode;

    spaceProj: mat4;
    spaceView: mat4;

    retainHeadpose: any;

    constructor() {
        super("SimpleTest");
    }

    init() {
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

        this.integrator = new integration.Integrator(integration.LorenzSystem01);

        // portal to another scene
        this.spaceFBO = new Framebuffer();
        this.spaceFBO.bind();
        this.spaceDiffuse = Texture.createTexture("spaceDiffuse", 1024, 1024, null, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE);
        this.spaceDepth = Texture.createTexture("spaceDepth", 1024, 1024, null, gl.DEPTH_COMPONENT, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT);
        this.spaceFBO.attachTexture(this.spaceDiffuse, gl.COLOR_ATTACHMENT0);
        this.spaceFBO.attachTexture(this.spaceDepth, gl.DEPTH_ATTACHMENT);

        this.spaceCamera = new SceneNode(this.root);

        this.spaceWindowPortal = new SceneNode(this.root);
        this.spaceWindowPortal.setScale([1, 1, 1]);

        this.spaceQuad = new SceneNode(this.root);
        this.spaceQuad.setPosition([0, 0, -15]);
        this.spaceQuad.setScale([1.5, 1.5, 1.5]);
        this.spaceQuad.color = vec4.fromValues(0, 1, 0, 1);
        this.spaceQuad.setRotation([0, 0, 1], Math.PI / 4);
        
        this.spaceQuad2 = new SceneNode(this.root);
        this.spaceQuad2.setPosition([0, 0,-5]);
        this.spaceQuad2.setScale([0.66, 0.66, 0.66]);
        this.spaceQuad2.color = vec4.fromValues(1, 1, 0, 1);

        this.spaceView = mat4.create();
        this.spaceProj = mat4.create();
        mat4.perspective(this.spaceProj, Math.PI / 2, 1024 / 1024, 0.1, 100000);
    }

    eventListener(event: ServerEvent) {
        if (event instanceof ControlPose6DofInputEventData) {            
            let rot = event.getQuaternion();
            this.controllerNode.rotation = quat.fromValues(rot[1], rot[2], rot[3], rot[0]);
            let controller = event.get6DofPosition();
            let pos = vec3.fromValues(0, 0, this.offset);
            vec3.transformQuat(pos, pos, this.controllerNode.rotation);
            vec3.add(pos, pos, controller);
            this.controllerNode.position = pos;
            this.spaceWindowPortal.position = this.controllerNode.position;
            this.spaceWindowPortal.rotation = this.controllerNode.rotation;
        } else if (event instanceof ControlTouchPadInputEventData) {
            let touch = event.getTouch();
            let deltaOffset = -touch[1] * touch[2] * this.delta;
            this.offset += deltaOffset;
        } else if (event instanceof EyeTrackingEventData) {
            let headPos = App.instance.getHeadposeWorldPosition()
            let headForward = App.instance.getHeadposeWorldForwardVector();
            let headUp = App.instance.getHeadposeWorldUpVector();
            let headLeft = vec3.create();
            vec3.cross(headLeft, headForward, headUp);
            vec3.scale(headLeft, headLeft, -1);

            let leftPos = event.getEyeTrackingLeftEyePosition();
            let rightPos = event.getEyeTrackingRightEyePosition();
            headPos = [(leftPos[0] + rightPos[0])/2, (leftPos[1] + rightPos[1]) / 2, (leftPos[2] + rightPos[2]) / 2];
            print(headPos);

            let error = App.instance.getHeadposeError();
            let camTransform = mat4.create();
            mat4.identity(camTransform);
            camTransform[0] = headLeft[0];
            camTransform[1] = headLeft[1];
            camTransform[2] = headLeft[2];
            camTransform[4] = headUp[0];
            camTransform[5] = headUp[1];
            camTransform[6] = headUp[2];
            camTransform[8] = headForward[0];
            camTransform[9] = headForward[1];
            camTransform[10] = headForward[2];
            camTransform[12] = headPos[0];
            camTransform[13] = headPos[1];
            camTransform[14] = headPos[2];
            
            //mat4.invert(camTransform, camTransform);

            let camRot = quat.create();
            mat4.getRotation(camRot, camTransform);

            let camPos = vec3.create();
            mat4.getTranslation(camPos, camTransform);

            let srcTransform = this.spaceWindowPortal.getTransform();
            mat4.invert(srcTransform, srcTransform);
            let srcRot = quat.create();
            mat4.getRotation(srcRot, srcTransform);

            let camPosSrc = vec3.create();
            vec3.transformMat4(camPosSrc, headPos, srcTransform);
            let camRotSrc = quat.create();
            quat.mul(camRotSrc, srcRot, camRot);

            let destTransform = this.spaceCamera.getTransform();
            let destRotation = quat.create();
            mat4.getRotation(destRotation, destTransform);

            let finalPosition = vec3.create();
            vec3.transformMat4(finalPosition, camPosSrc, destTransform);
            let finalRotation = quat.create();
            quat.mul(finalRotation, destRotation, camRotSrc);

            mat4.identity(this.spaceView);
            mat4.translate(this.spaceView, this.spaceView, finalPosition);
            mat4.rotate(this.spaceView, this.spaceView, finalRotation[3], [finalRotation[0], finalRotation[1], finalRotation[2]]);
        }  
    }

    update(delta: number) {
        if (!this.retainHeadpose) {
            this.retainHeadpose = App.instance.prism.retainHeadposeUpdates();
        }
        
        this.delta = delta;
        this.integrator.integrate(delta);
        let state = this.integrator.state;
        this.quad2.setPosition(state);
    }

    preDraw() {
        this.spaceFBO.bind();
        gl.clearColor(1, 0, 0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this.bufferPC.use();
        gl.uniformMatrix4fv(1, false, this.spaceView);
        gl.uniformMatrix4fv(2, false, this.spaceProj);
        this.quadBufferPC.beginBatch();
        this.quadBufferPC.draw(this.spaceQuad, this.spaceQuad2);
        this.quadBufferPC.endBatch();
        this.spaceFBO.unbind();
    }

    draw(eye: number, delta: number) {  
        let view = Renderer.instance.getViewMatrix(eye);
        let proj = Renderer.instance.getProjectionMatrix(eye);

        Renderer.instance.bindEyeFBO(eye);

        gl.clearColor(0, 0, 0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.bufferPC.use();
        gl.uniformMatrix4fv(1, false, view);
        gl.uniformMatrix4fv(2, false, proj);
        this.quadBufferPC.beginBatch();
        this.quadBufferPC.draw(this.quad, this.quad2);
        this.quadBufferPC.endBatch();

        this.bufferPCT.use();
        gl.uniformMatrix4fv(1, false, view);
        gl.uniformMatrix4fv(2, false, proj);
        gl.activeTexture(gl.TEXTURE0);
        this.font.bind();
        gl.uniform1i(3, 0);
        this.charBuffer.beginDraw();
        this.charBuffer.draw("Hello, world!\nNew Line", this.textTransform);
        this.charBuffer.endDraw();

        gl.activeTexture(gl.TEXTURE0);
        this.spaceDiffuse.bind();
        gl.uniform1i(3, 0);
        this.quadBufferPCT.beginBatch();        
        this.quadBufferPCT.draw(this.spaceWindowPortal);
        this.quadBufferPCT.endBatch();
    }

    async deInit() {

    }
}