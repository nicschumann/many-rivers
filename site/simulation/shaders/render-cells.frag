precision highp float;

varying vec2 v_uv;
varying vec2 v_id;
varying vec3 v_pos;
varying float v_type;

uniform vec3 u_color;

void main() {
    // Sample the terrain-rgb tile at the current fragment location.


    if ((mod(v_id.x, 2.0) == 0.0 || mod(v_id.y, 2.0) == 0.0) && !(mod(v_id.x, 2.0) == 0.0 && mod(v_id.y, 2.0) == 0.0)) {
      gl_FragColor = vec4(0.0, 0.2, 0.1, 1.0);
    } else {
      gl_FragColor = vec4(1.0, 0.2, 0.0, 1.0);
    }

    
}