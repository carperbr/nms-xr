export const vs = `
    #version 300 es
    #extension GL_ARB_explicit_uniform_location : enable

    layout(location = 0) in vec3 vertexPosition;
    layout(location = 1) in vec4 vertexColor;
    layout(location = 2) in vec2 vertexTexCoord;

    layout(location = 0) uniform mat4 model;
    layout(location = 1) uniform mat4 view;
    layout(location = 2) uniform mat4 proj;

    varying vec4 color;
    varying vec2 texCoord;

    void main() {
        gl_Position = proj * view * vec4(vertexPosition, 1.0);
        color = vertexColor;
        texCoord = vertexTexCoord;
    }
`

export const fs = `
    #version 300 es
    #extension GL_ARB_explicit_uniform_location : enable

    precision mediump float;
    varying vec4 color;
    varying vec2 texCoord;

    layout(location = 3) uniform sampler2D diffuseTexture;

    void main() {
        gl_FragColor = color * texture2D(diffuseTexture, texCoord);
    }
`