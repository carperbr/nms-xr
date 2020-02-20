import gl from 'gl';
import { Texture } from './Texture';

export class Framebuffer {
    id: number;
    
    constructor() {
        this.id = gl.createFramebuffer();
    }

    bind() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
    }

    // meh
    unbind() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    attachTexture(texture: Texture, attachment: number) {
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, texture.id, 0);
    }
}