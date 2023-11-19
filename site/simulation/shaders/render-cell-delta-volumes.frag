precision highp float;

varying vec2 v_uv;
varying vec2 v_id;
varying vec3 v_pos;
varying float v_type;
varying float v_dS;

uniform vec3 u_color;
uniform float u_alpha;

const float epsilon = 0.01;
const float max_change = 2.0;

void main() {
    // Sample the terrain-rgb tile at the current fragment location.

    vec3 base_unchanged_color = vec3(0.2, 0.2, 0.3);
    vec3 base_changed_color = vec3(0.80, 0.73, 0.05) * 0.5;
    vec3 max_erosion_color = vec3(0.80, 0.30, 0.05);
    vec3 max_accretion_color = vec3(0.34, 0.80, 0.05);

    float t = abs(v_dS) / max_change;

   if (v_dS > epsilon) {
    vec3 color = (1. - t) * base_changed_color + t * max_accretion_color;
    gl_FragColor = vec4(color, u_alpha);
   } else if (v_dS < -epsilon) {
    vec3 color = (1. - t) * base_changed_color + t * max_erosion_color;
    gl_FragColor = vec4(color, u_alpha);
   } else {
    discard;
   }   
}