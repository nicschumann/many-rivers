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

vec3 ambient_light_color = vec3(0.55, -0.1, 1.0);

vec3 diffuse_light_position = vec3(0.0, 0.1 , 0.0) + u_basepoint;
vec3 diffuse_light_color = vec3(0.6, 0.3, 0.2);

const float scale = 0.05;


void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    if (v_W <= 0.0) { discard; }
    vec3 e = vec3(1.0 / u_tex_resolution, 0.);

    // basic params
    // vec3 normal = normalize(texture2D(u_N, v_uv).rgb);
    vec3 normal = normalize(vec3(0., 1., 0.) + 0.05 * texture2D(u_N, v_uv).rgb);
    vec3 view_dir = normalize(v_pos - u_view_pos);

    // scattering
    vec3 step_dir = view_dir / max(abs(view_dir.x), abs(view_dir.z));
    step_dir *= 1.0 / u_resolution.x;
    step_dir *= 0.1;
    // step_dir *= vec3(e.x, scale, e.y) * 0.5;

    vec3 p_start = vec3(v_uv.x, v_pos.y, v_uv.y);
    vec3 p_curr = vec3(0.);
    float h_curr = 0.0;
    float t = 0.0;

    for (int i = 0; i < 5000; i += 1) {
        p_curr = p_start + t * step_dir;
        h_curr = texture2D(u_H, p_curr.xz).g * scale;
        t += 1.0;

        if (h_curr > p_curr.y) { break; }
    }

    // secular
    vec3 light_dir = normalize(v_pos - diffuse_light_position);
    vec3 R = reflect(view_dir, normal);
    float spec = pow(dot(R, -light_dir), 100.4) * 1.;


    gl_FragColor = vec4(
        // vec3(0.3 - length(p_curr - p_start) * 2.) * vec3(0.2, 0.4, 0.5),
        vec3(spec),
        // normal * 0.5 + 0.5,
        1.
    );

}