precision highp float;

varying vec2 v_uv;
varying vec2 v_id;
varying vec3 v_pos;
varying float v_type;
varying float v_dS;

uniform vec3 u_color;
uniform float u_alpha;

const float epsilon = 0.01;

void main() {
    // Sample the terrain-rgb tile at the current fragment location.


   if (v_dS > epsilon) {
    gl_FragColor = vec4(vec3(0.0, 1.0, 0.2) * v_dS / 4.0, 1.0);
   } else if (v_dS < -epsilon) {
    gl_FragColor = vec4(vec3(1.0, 0.2, 0.0) * -v_dS / 4.0, 1.0);
   } else {
    gl_FragColor = vec4(0.2, 0.2, 0.3, u_alpha);
   }

    
}