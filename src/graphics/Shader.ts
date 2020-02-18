import gl from "gl";

export enum ShaderType {
    Vertex = gl.VERTEX_SHADER,
    Fragment = gl.FRAGMENT_SHADER
}

// TODO: Cache shaders
export class Shader {
    id: number;
    type: ShaderType;

    constructor(source: string, type: ShaderType) {
        this.id = gl.createShader(type);
        this.type = type;
        gl.shaderSource(this.id, source);
        gl.compileShader(this.id);

        if (!gl.getShaderParameter(this.id, gl.COMPILE_STATUS)) {
            let log = gl.getShaderInfoLog(this.id);
            let typeStr = type == ShaderType.Vertex ? "VS" : "FS";
            throw new Error(`${typeStr} COMPILE ERROR: ${log}`)
        }
    }
}