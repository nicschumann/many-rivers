precision highp float;

attribute vec3 a_position;
attribute vec2 a_uv;
attribute vec2 a_id;

varying vec2 v_uv;
varying vec2 v_id;

uniform mat4 u_transform;
uniform vec3 u_basepoint;

uniform sampler2D u_H;

const float scale = 0.1;

void main() {
    v_uv = a_uv;
    v_id = a_id;

    float S = texture2D(u_H, a_uv).g * scale;
    vec3 displaced = u_basepoint + vec3(0., S, 0.);
    vec4 position = vec4(a_position + displaced, 1.0);

    vec4 pos = u_transform * position;
    gl_Position = pos;

    // gl_Position = vec4(shifted_pos.xy, 0., 1.);
}