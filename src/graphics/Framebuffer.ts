import gl from 'gl';

export class Framebuffer {
    id: number;
    
    constructor() {
        this.id = gl.createFramebuffer();
    }

    bind() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
    }
}