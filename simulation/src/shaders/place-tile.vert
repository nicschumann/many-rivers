precision highp float;

attribute vec2 a_position;
attribute vec2 a_uv;

varying vec2 v_uv;
varying vec2 v_position;

uniform mat3 u_transform;

void main() {
    v_uv = a_uv;
    v_position = a_position;
    vec3 pos = u_transform * vec3(a_position, 1.0);
    gl_Position = vec4(pos.xy, 0.0, 1.0);
}