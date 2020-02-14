import gl from "gl";
import { Shader } from "./Shader";

export class Program {
    id: number;

    attributes: Map<string, number>;
    uniforms: Map<string, number>;

    constructor(...shaders: Shader[]) {
        this.id = gl.createProgram();

        for (let shader of shaders) {
            gl.attachShader(this.id, shader.id);
        }

        gl.linkProgram(this.id);

        if (!gl.getProgramParameter(this.id, gl.LINK_STATUS)) {
            let log = gl.getProgramInfoLog(this.id);
            throw new Error(`LINK ERROR: ${log}`);
        }

        this.attributes = new Map<string, number>();
        this.uniforms = new Map<string, number>();

        for (let i = 0; i < gl.getProgramParameter(this.id, gl.ACTIVE_ATTRIBUTES); i++) {
            let info = gl.getActiveAttrib(this.id, i);
            let location = gl.getAttribLocation(this.id, info.name);
            this.attributes.set(info.name, location);
        }

        for (let i = 0; i < gl.getProgramParameter(this.id, gl.ACTIVE_UNIFORMS); i++) {
            let info = gl.getActiveUniform(this.id, i);
            let location = gl.getUniformLocation(this.id, info.name);
            this.uniforms.set(info.name, location);
        }
    }

    use() {
        gl.useProgram(this.id);
    }
}

export class Attribute {
    name: string;
    location: number;
    value: number | number[] | number[][];
}

export class Uniform {
    name: string;
    location: number;
    value: number | number[] | number[][];
}