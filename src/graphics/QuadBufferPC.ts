import gl from "gl";
import { Node } from "../scene";
import { mat4, vec3 } from "gl-matrix";
import { QuadBuffer } from "./QuadBuffer";

export class QuadBufferPC extends QuadBuffer {
    constructor() {
        super();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboId);
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 7 * 4, 0);
        gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 7 * 4, 3 * 4);
        gl.bindVertexArray(null);
    }

    draw(...nodes: Node[]): void {
        for (let node of nodes) {
            let rot = mat4.create();
            mat4.fromQuat(rot, node.rotation);

            let indices = [ 0, 1, 2, 2, 3, 0 ].map(i => i + this.indices.length);
            
            let va = vec3.fromValues(node.position[0] - node.scale[0], node.position[1] + node.scale[1], node.position[2]);
            let vb = vec3.fromValues(node.position[0] + node.scale[0], node.position[1] + node.scale[1], node.position[2]);
            let vc = vec3.fromValues(node.position[0] + node.scale[0], node.position[1] - node.scale[1], node.position[2]);
            let vd = vec3.fromValues(node.position[0] - node.scale[0], node.position[1] - node.scale[1], node.position[2]);

            vec3.transformMat4(va, va, rot);
            vec3.transformMat4(vb, vb, rot);
            vec3.transformMat4(vc, vc, rot);
            vec3.transformMat4(vd, vd, rot);

            let vertices = [
                ...va, node.color[0], node.color[1], node.color[2], node.color[3],
                ...vb, node.color[0], node.color[1], node.color[2], node.color[3],
                ...vc, node.color[0], node.color[1], node.color[2], node.color[3],
                ...vd, node.color[0], node.color[1], node.color[2], node.color[3]
            ];

            this.indices = this.indices.concat(indices);
            this.vertices = this.vertices.concat(vertices);
        }
    }

    protected render(): void {
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}