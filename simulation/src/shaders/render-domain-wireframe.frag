#extension GL_EXT_shader_texture_lod : enable
#extension GL_OES_standard_derivatives : enable

precision highp float;

varying vec2 v_uv;
varying vec2 v_id;
varying vec3 v_pos;

uniform sampler2D u_H;
uniform sampler2D u_N;


void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    vec3 terrain_color = vec3(0.65, 0.7, 0.44);
    gl_FragColor = vec4(terrain_color, 1.);
}