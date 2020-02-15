import gl from 'gl';
import { SceneNode } from "../scene";

export abstract class QuadBuffer {
    vaoId: number;
    vboId: number;
    eboId: number;

    vertices: number[];
    indices: number[];

    constructor() {
        this.vaoId = gl.createVertexArray();

        gl.bindVertexArray(this.vaoId);
        this.vboId = gl.createBuffer();
        this.eboId = gl.createBuffer();
    }

    beginBatch(): void {
        this.vertices = [];
        this.indices = [];
    }

    endBatch(): void {
        gl.bindVertexArray(this.vaoId);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboId);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.eboId);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.DYNAMIC_DRAW);

        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

        gl.bindVertexArray(null);
    }

    // draws an array of nodes into the buffer.
    abstract draw(...nodes: SceneNode[]): void;
}