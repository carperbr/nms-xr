export const vs = `
    #version 300 es
    #extension GL_ARB_explicit_uniform_location : enable

    layout(location = 0) in vec3 vertexPosition;
    layout(location = 1) in vec4 vertexColor;

    layout(location = 0) uniform mat4 model;
    layout(location = 1) uniform mat4 view;
    layout(location = 2) uniform mat4 proj;

    varying vec4 color;

    void main() {
        gl_Position = proj * view * vec4(vertexPosition, 1.0);
        color = vertexColor;
    }
`

export const fs = `
    #version 300 es

    precision mediump float;
    varying vec4 color;

    void main() {
        gl_FragColor = color;
    }
`