#extension GL_EXT_shader_texture_lod : enable
#extension GL_OES_standard_derivatives : enable

precision highp float;

varying float v_W;
varying float v_S;
varying vec2 v_uv;
varying vec2 v_id;
varying vec3 v_pos;

uniform sampler2D u_H;
uniform sampler2D u_N;
uniform vec3 u_view_pos;
uniform vec2 u_tex_resolution;
uniform vec2 u_resolution;
uniform vec3 u_basepoint;

vec3 ambient_light_color = vec3(0.55, 0.6, 1.0);

vec3 diffuse_light_position = vec3(0.5, 2.0, 0.5);
vec3 diffuse_light_color = vec3(0.6, 0.3, 0.2);

const float scale = 0.05;


void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    if (v_W <= 0.0) { discard; }
    vec3 e = vec3(1.0 / u_tex_resolution, 0.);

    vec3 dir = normalize(v_pos - u_view_pos);
    dir /= max(abs(dir.x), abs(dir.z));
    dir *= 1.0 / u_resolution.x;
    dir *= 0.1;
    // dir *= vec3(e.x, scale, e.y) * 0.5;

    vec3 p_start = vec3(v_uv.x, v_pos.y, v_uv.y);
    float t = 0.0;

    for (int i = 0; i < 5000; i += 1) {
        vec3 p_curr = p_start + t * dir;
        float h_curr = texture2D(u_H, p_curr.xz).g * scale;
        
        t += 1.0;

        if (h_curr > p_curr.y) { break; }
    }


    gl_FragColor = vec4(
        t / 400.0,
        0.,
        0.,
        1.
    );

}