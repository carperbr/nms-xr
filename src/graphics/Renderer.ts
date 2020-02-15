import egl from "egl";
import gl from "gl";
import { ExclusiveRender, ImmersiveApp } from "lumin";
import { Framebuffer } from "./Framebuffer";
import { mat4 } from "gl-matrix";

export class Renderer {
    context: egl.Context;    
    exclusiveRender: ExclusiveRender;
    frameInfo: ExclusiveRender.FrameInfo;
    frameParams: ExclusiveRender.FrameParams;    
    eyeBuffer: Framebuffer;
    
    private constructor() {
        egl.initialize(0, 0);
        egl.bindAPI(egl.OPENGL_ES_API);
        this.context = egl.createContext(3, 0);
        egl.makeCurrent(null, null, this.context);
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0, 0, 1, 1.0);
        this.eyeBuffer = new Framebuffer();
        gl.disable(gl.CULL_FACE);
    }

    initialize(exclusiveRender: ExclusiveRender) {
        this.exclusiveRender = exclusiveRender;
        this.frameInfo = new ExclusiveRender.FrameInfo();
        this.frameParams = new ExclusiveRender.FrameParams();
    }

    bindEyeBuffer(eye: number): void {
        this.eyeBuffer.bind();
        gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, this.frameInfo.getColorId(), 0, eye);
        gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, this.frameInfo.getDepthId(), 0, eye);
    }

    beginFrame(): void {
        this.exclusiveRender.beginFrame(this.frameParams, this.frameInfo);
        let [x, y] = this.frameInfo.getViewPortLowerLeft();
        let [w, h] = this.frameInfo.getViewPortSize();
        gl.viewport(x, y, w, h);
    }

    endFrame(): void {
        this.exclusiveRender.endFrame(this.frameInfo, true);
    }

    getViewMatrix(eye: number): mat4 {
        let view = mat4.create();
        mat4.copy(view, <any>this.frameInfo.getView(eye));
        return view;
    }
    
    getProjectionMatrix(eye: number): mat4 {
        let proj = mat4.create();
        mat4.copy(proj, <any>this.frameInfo.getProj(eye));
        return proj;
    }

    private static _instance: Renderer;
    static get instance() {
        if (!Renderer._instance) {
            Renderer._instance = new Renderer();
        }

        return Renderer._instance;
    }
}