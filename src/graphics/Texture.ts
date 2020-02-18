import gl, { ImageData } from 'gl';
import png from 'png';
import jpeg from 'jpeg';

export class Texture {
    id: number;
    texture: string;

    width: number;
    height: number;

    constructor() {
        this.id = gl.createTexture();
    }

    bind() {
        gl.bindTexture(gl.TEXTURE_2D, this.id);
    }

    static cache: Map<string, Texture> = new Map<string, Texture>();

    static loadTexture(path: string) {
        if (Texture.cache.has(path)) {
            return Texture.cache.get(path);
        }

        let texture = new Texture();
        texture.bind();
        texture.width = 1;
        texture.height = 1;
        let pixel = new Uint8Array([0, 0, 0, 255]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        fetch(path)
            .then(v => v.arrayBuffer())
            .then(data => {
                let decoded: ImageData;
                if (path.toLowerCase().endsWith(".png")) {
                    decoded = png.decode(data);
                } else if (path.toLowerCase().endsWith(".jpg")) {
                    decoded = jpeg.decode(data);
                }

                gl.bindTexture(gl.TEXTURE_2D, texture.id);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, decoded);

                if ((decoded.width & (decoded.width - 1)) === 0) {
                    gl.generateMipmap(gl.TEXTURE_2D);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                } else {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                }

                texture.width = decoded.width;
                texture.height = decoded.height;
            })
            .catch(err => {
                throw new Error(`Error loading image: ${err}`);
            });

        Texture.cache.set(path, texture);
    
        return texture;
    }

    static createTexture(name: string, pic: number[], width: number, height: number) {
        let texture: Texture;

        if (Texture.cache.has(name)) {
            texture = Texture.cache.get(name);
        } else {
            texture = new Texture();
        }

        texture.bind();
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(pic));

        Texture.cache.set(name, texture);

        return texture;
    }
}