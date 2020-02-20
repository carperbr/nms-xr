import gl from 'gl';
import { mat4, vec3, vec2, vec4 } from 'gl-matrix';

export class CharBuffer {
    chars: Map<number, BitmapChar>;
    kerning: Map<number[], number>;

    lineHeight: number;
    width: number;
    height: number;

    vaoId: number;
    vboId: number;
    eboId: number;

    vertices: number[];
    indices: number[];

    constructor(path: string) {
        this.chars = new Map<number, BitmapChar>();
        this.kerning = new Map<number[], number>();

        this.vertices = [];
        this.indices = [];

        this.vaoId = gl.createVertexArray();
        this.vboId = gl.createBuffer();
        this.eboId = gl.createBuffer();

        gl.bindVertexArray(this.vaoId);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboId);
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 9 * 4, 0);
        gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 9 * 4, 3 * 4);
        gl.vertexAttribPointer(2, 2, gl.FLOAT ,false, 9 * 4, 7 * 4);
        gl.bindVertexArray(null);

        fetch(path)
            .then(v => v.json())
            .then(json => {
                let chars = <BitmapChar[]>json.chars;
                let kernings = <BitmapKerning[]>json.kernings;
                this.lineHeight = json.common.lineHeight;
                this.width = json.common.scaleW;
                this.height = json.common.scaleH;

                for (let char of chars) {
                    this.chars.set(char.id, char);
                }

                for (let kerning of kernings) {
                    this.kerning.set([kerning.first, kerning.second], kerning.amount);
                }
            })
            .catch(err => {
                throw new Error(`Error loading font: ${err}`);
            });
    }

    beginDraw() {
        this.vertices = [];
        this.indices = [];
    }

    // Need to test if transforming text vertices on CPU is slower than multiple draw calls with model matrices supplied
    draw(text: string, transform: mat4, color?: vec4) {
        let cursorX: number = 0;
        let cursorY: number = 0;
        let lastCode: number = -1;

        for (let char of text) {
            if (char == "\n") {
                cursorY -= this.lineHeight;
                cursorX = 0;
                lastCode = -1;
            } else {
                let code = char.charCodeAt(0);

                if (this.chars.has(code)) {
                    let obj = this.chars.get(code);

                    if (this.chars.has(lastCode)) {
                        if (this.kerning.has([lastCode, code])) {
                            cursorX += this.kerning.get([lastCode, code]);
                        }
                    }
                    
                    let va = vec3.fromValues((cursorX + obj.xoffset) / this.lineHeight, (cursorY + (this.lineHeight - obj.yoffset)) / this.lineHeight, 0);
                    let vb = vec3.fromValues((cursorX + obj.xoffset + obj.width) / this.lineHeight, (cursorY + (this.lineHeight - obj.yoffset)) / this.lineHeight, 0);
                    let vc = vec3.fromValues((cursorX + obj.xoffset + obj.width) / this.lineHeight, (cursorY + (this.lineHeight - obj.yoffset - obj.height)) / this.lineHeight, 0);
                    let vd = vec3.fromValues((cursorX + obj.xoffset) / this.lineHeight, (cursorY + (this.lineHeight - obj.yoffset - obj.height)) / this.lineHeight, 0);

                    vec3.transformMat4(va, va, transform);
                    vec3.transformMat4(vb, vb, transform);
                    vec3.transformMat4(vc, vc, transform);
                    vec3.transformMat4(vd, vd, transform);

                    let x = obj.x / this.width;
                    let y = obj.y / this.height;
                    let w = obj.width / this.width;
                    let h = obj.height / this.height;

                    let tca = vec2.fromValues(x, y);
                    let tcb = vec2.fromValues(x + w, y);
                    let tcc = vec2.fromValues(x + w, y + h);
                    let tcd = vec2.fromValues(x, y + h);

                    let ca: vec4;
                    let cb: vec4;
                    let cc: vec4;
                    let cd: vec4;

                    if (color) {
                        ca = cb = cc = cd = color;
                    } else {
                        ca = cb = cc = cd = vec4.fromValues(1, 1, 1, 1);
                    }

                    let vertices = [
                        va[0], va[1], va[2], ca[0], ca[1], ca[2], ca[3], tca[0], tca[1],
                        vb[0], vb[1], vb[2], cb[0], cb[1], cb[2], cb[3], tcb[0], tcb[1],
                        vc[0], vc[1], vc[2], cc[0], cc[1], cc[2], cc[3], tcc[0], tcc[1],
                        vd[0], vd[1], vd[2], cd[0], cd[1], cd[2], cc[3], tcd[0], tcd[1]
                    ];

                    let offset = (this.indices.length / 6) * 4;
                    let indices = [ offset, offset + 1, offset + 2, offset + 2, offset + 3, offset ];

                    this.indices = this.indices.concat(indices);
                    this.vertices = this.vertices.concat(vertices);

                    cursorX += obj.xadvance;
                    lastCode = code;
                }
            }
        }
    }

    endDraw() {
        gl.bindVertexArray(this.vaoId);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboId);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.eboId);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.DYNAMIC_DRAW);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }
}

export class BitmapChar {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    xoffset: number;
    yoffset: number;
    xadvance: number;
}

export class BitmapKerning {
    first: number;
    second: number;
    amount: number;
}