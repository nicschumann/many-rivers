precision highp float;

attribute vec2 a_position;

uniform mat4 u_transform;
uniform vec3 u_basepoint;
uniform vec2 u_resolution;

uniform sampler2D u_H;

void main() {
    gl_Position = view_position;
}