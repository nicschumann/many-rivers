#extension GL_EXT_shader_texture_lod : enable
#extension GL_OES_standard_derivatives : enable

precision highp float;

varying vec2 v_uv;
varying vec2 v_id;
varying vec3 v_pos;

uniform sampler2D u_H;
uniform sampler2D u_N;

vec3 ambient_light_color = vec3(0.55, 0.6, 1.0);

vec3 diffuse_light_position = vec3(1.5, 1.5, 1.5);
vec3 diffuse_light_color = vec3(0.6, 0.3, 0.2);

void main() {
    // Sample the terrain-rgb tile at the current fragment location.

    vec3 terrain_color = vec3(0.65, 0.7, 0.44);

    float ambient_strength = 0.3;
    vec3 ambient = ambient_light_color * ambient_strength;

    vec3 dFdxPos = dFdx( v_pos );
    vec3 dFdyPos = dFdy( v_pos );
    vec3 facenormal = normalize(cross(dFdxPos, dFdyPos));
    
    
    vec3 normal = normalize(texture2D(u_N, v_uv).rgb);
    vec3 light_direction = normalize(diffuse_light_position - v_pos);
    float diffuse_strength = max(dot(facenormal, light_direction), 0.);
    vec3 diffuse = diffuse_strength * diffuse_light_color;


    vec3 color = (ambient + diffuse) * terrain_color;
    color = vec3(1.0, 0.2, 0.);
    // gl_FragColor = vec4(v_uv, 0., 1.);
}