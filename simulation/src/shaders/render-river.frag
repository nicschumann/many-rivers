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
vec3 diffuse_light_color = vec3(0.8, 0.7, 0.7);

const float scale = 0.001;


float beer_lambert_law(float absorption, float step_size)
{
    return exp(-absorption * step_size);
}

void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    if (v_W <= 0.0) { discard; }
    vec3 e = vec3(1.0 / u_tex_resolution, 0.);

    // basic params
    // vec3 normal = normalize(texture2D(u_N, v_uv).rgb);
    vec3 normal = normalize(vec3(0., 1., 0.) + 0.05 * texture2D(u_N, v_uv).rgb);
    vec3 view_dir = normalize(v_pos - u_view_pos);
    vec3 light_dir = normalize(v_pos - diffuse_light_position);

    // scattering
    vec3 step_dir = view_dir;
    step_dir = step_dir / max(abs(step_dir.x), abs(step_dir.z));
    step_dir *= 1.0 / u_resolution.x;
    step_dir *= 0.1;
    float step_size = length(step_dir);
    // step_dir *= vec3(e.x, scale, e.y) * 0.5;

    vec3 p_start = vec3(v_uv.x, v_pos.y, v_uv.y);
    vec3 p_curr = vec3(0.);
    float h_curr = 0.0;
    float t = 0.0;


    const float absorption_coefficient = 100.0;
    float visibility = 1.0;
    vec3 volumetric_color = vec3(0.0);

    

    for (int i = 0; i < 5000; i += 1) {
        p_curr = p_start + t * step_dir;
        h_curr = texture2D(u_H, p_curr.xz).g * scale;
        t += 1.0;

        float prev_visibility = visibility;
        visibility *= beer_lambert_law(absorption_coefficient, step_size);
        float absorption_at_step = prev_visibility - visibility;

        float light_dist = length(diffuse_light_position - p_curr);
        float light_attenuation = 1.0 / pow(light_dist, 0.8);
        vec3 light_color = diffuse_light_color * light_attenuation;

        volumetric_color += absorption_at_step * light_color;
        volumetric_color += absorption_at_step * vec3(0.2, 0.4, 0.5);

        if (h_curr > p_curr.y) { break; }
    }


    // float Hb = half_point.y - p_curr.y;
    // a = -extinction_coefficient * Hb;
    // vec3 iso_scattering_bot = bottom_plane * max(0.0, exp(a) - a * Ei(a));

    // vec3 ambient = iso_scattering_top + iso_scattering_bot;

    // vec3 scattering = vec3(0.3 - length(p_curr - p_start) * 2.) * vec3(0.2, 0.4, 0.5); 

    // specular
    vec3 R = reflect(view_dir, normal);
    float spec_coefficient = pow(dot(R, -light_dir), 80.4) * 0.2;
    vec3 specular = vec3(0.8, 0.6, 0.5) * spec_coefficient;
    
    // transparency
    float alpha = 1.0;

    gl_FragColor = vec4(
        volumetric_color + specular,

        // vec3(0.3 - length(p_curr - p_start) * 2.) * vec3(0.2, 0.4, 0.5),
        // vec3(spec) * diffuse_light_color + scattering,
        // normal * 0.5 + 0.5,
        length(p_curr - p_start) / 0.02
    );

}