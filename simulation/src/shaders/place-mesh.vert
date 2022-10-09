precision highp float;

attribute vec3 a_position;
attribute vec2 a_uv;
attribute vec2 a_id;

varying vec2 v_uv;
varying vec2 v_id;

uniform mat4 u_transform;
uniform vec3 u_basepoint;

void main() {
    v_uv = a_uv;
    v_id = a_id;

    vec4 position = vec4(a_position + u_basepoint, 1.0);

    vec4 pos = u_transform * position;
    gl_Position = pos;

    // gl_Position = vec4(shifted_pos.xy, 0., 1.);
}