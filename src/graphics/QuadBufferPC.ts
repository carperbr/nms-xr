import gl from "gl";
import { SceneNode } from "../scene";
import { mat4, vec3, vec4 } from "gl-matrix";
import { QuadBuffer } from "./QuadBuffer";

export class QuadBufferPC extends QuadBuffer {
    constructor() {
        super();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboId);
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 7 * 4, 0);
        gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 7 * 4, 3 * 4);
        gl.bindVertexArray(null)
    }

    draw(...nodes: SceneNode[]): void {
        for (let node of nodes) {
            let va = vec3.fromValues(-0.5, 0.5, 0);
            let vb = vec3.fromValues(0.5, 0.5, 0);
            let vc = vec3.fromValues(0.5, -0.5, 0);
            let vd = vec3.fromValues(-0.5, -0.5, 0);

            let mat = node.getTransform();
            vec3.transformMat4(va, va, mat);
            vec3.transformMat4(vb, vb, mat);
            vec3.transformMat4(vc, vc, mat);
            vec3.transformMat4(vd, vd, mat);

            let color = node.color;
            let colors = node.colors;
            let ca: vec4;
            let cb: vec4;
            let cc: vec4;
            let cd: vec4;

            if (colors && colors.length > 3) {
                ca = colors[0];
                cb = colors[1];
                cc = colors[2];
                cd = colors[3];
            } else {
                ca = cb = cc = cd = color;
            }

            let vertices = [
                va[0], va[1], va[2], ca[0], ca[1], ca[2], ca[3],
                vb[0], vb[1], vb[2], cb[0], cb[1], cb[2], cb[3],
                vc[0], vc[1], vc[2], cc[0], cc[1], cc[2], cc[3],
                vd[0], vd[1], vd[2], cd[0], cd[1], cd[2], cd[3]
            ];

            let indices = [ 0, 1, 2, 2, 3, 0 ].map(i => this.indices.length > 0 ? (i + 1 + (this.indices.length / 2)) : i);
            
            this.indices = this.indices.concat(indices);
            this.vertices = this.vertices.concat(vertices);
        }
    }
}