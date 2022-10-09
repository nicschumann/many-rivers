precision highp float;

attribute vec3 a_position;
attribute vec2 a_uv;
attribute vec2 a_id;

varying vec2 v_uv;
varying vec2 v_id;
varying vec3 v_norm;

uniform mat4 u_transform;
uniform vec3 u_basepoint;
uniform vec2 u_resolution;

uniform sampler2D u_H;

const float scale = 0.05;

void main() {
    vec3 e = vec3(1.0 / u_resolution, 0.);

    float S = texture2D(u_H, a_uv).g;

    float Sx = texture2D(u_H, a_uv + e.xz).g;
    float Sy = texture2D(u_H, a_uv + e.zy).g;

    vec3 dx = vec3(e.x, Sx - S, 0.0);
    vec3 dy = vec3(0.0, Sy - S, e.y);
    vec3 n = normalize(cross(dy, dx));

    v_norm = n;
    v_uv = a_uv;
    v_id = a_id;


    vec3 displaced = u_basepoint + vec3(0., S * scale, 0.);
    vec4 position = vec4(a_position + displaced, 1.0);

    vec4 pos = u_transform * position;
    gl_Position = pos;

    // gl_Position = vec4(shifted_pos.xy, 0., 1.);
}