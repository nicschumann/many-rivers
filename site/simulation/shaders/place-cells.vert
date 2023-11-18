precision highp float;

#define FILTER_RANGE 0

attribute vec3 a_position;
attribute vec2 a_uv;
attribute vec2 a_id;
attribute float a_type;

varying vec2 v_uv;
varying vec2 v_id;
varying vec3 v_pos;
varying float v_type;

uniform mat4 u_transform;
uniform vec3 u_basepoint;
uniform vec2 u_resolution;

uniform sampler2D u_H;

const float scale = 0.001;

void main() {

    float S = texture2D(u_H, a_uv).g;
    vec3 displaced = u_basepoint + vec3(0., S * scale, 0.);

    vec3 position = a_position + displaced;

    v_uv = a_uv;
    v_id = a_id;
    v_type = a_type;
    v_pos = position; // + noise(position) * 1.0;    

    vec4 view_position = u_transform * vec4(position, 1.0);
    gl_Position = view_position;

    // gl_Position = vec4(shifted_pos.xy, 0., 1.);
}