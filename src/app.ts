import { ImmersiveApp, ui, FPS_DELTA, ExclusiveRender, Prism, ServerEvent, GestureInputEventData } from 'lumin';
import { SceneManager, Node } from "./scene";
import { Renderer, ShaderType } from "./graphics";

import * as BufferPC from "./graphics/shaders/BufferPC.glsl";
import { Shader, Program, QuadBufferPC } from "./graphics";

import gl from 'gl';
import { mat4 } from 'gl-matrix';

export class App extends ImmersiveApp {
    sceneManager: SceneManager;
    renderer: Renderer;

    prism: Prism;
    root: Node;

    quadBuffer: QuadBufferPC;
    quadProgram: Program;

    quadA: Node;

    onAppStart () {
        this.setEventSleepTime(FPS_DELTA);
        this.setOcclusionEnabled(false);
        this.prism = this.requestNewPrism([6, 6, 6]);

        this.sceneManager = new SceneManager();
        this.renderer = new Renderer();

        let options = new ExclusiveRender.ClientOptions();
        let exclusiveRender = this.startExclusiveModeGL(options, <any>this.renderer.context);
        this.renderer.initialize(exclusiveRender);

        this.quadBuffer = new QuadBufferPC();
        
        let vs = new Shader(BufferPC.vs, ShaderType.Vertex);
        let fs = new Shader(BufferPC.fs, ShaderType.Fragment);
        this.quadProgram = new Program(vs, fs);

        this.quadA = new Node();
        this.quadA.setPosition([0, 1, 2]);
    }

    eventListener(event: ServerEvent): boolean {
        if (event instanceof GestureInputEventData) {

        }

        return false;
    }

    updateLoop (delta: number) {
        this.renderer.beginFrame();
        
        for (let i = 0; i < 2; i++) {
            let view = this.renderer.getViewMatrix(i);
            let proj = this.renderer.getProjectionMatrix(i);

            this.renderer.bindEyeBuffer(i);

            this.quadProgram.use();

            gl.uniformMatrix4fv(0, false, mat4.create());
            gl.uniformMatrix4fv(1, false, view);
            gl.uniformMatrix4fv(2, false, proj);

            this.quadBuffer.beginBatch();
            this.quadBuffer.draw(this.quadA);
            this.quadBuffer.endBatch();
        }

        this.renderer.endFrame();

        return true;
    }

    init () {
        return 0;
    }

    deInit(): number {
        this.stopExclusiveMode();
        return 0;
    }
}
