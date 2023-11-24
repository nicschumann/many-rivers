precision highp float;

attribute vec3 a_position;
attribute vec2 a_uv;
attribute vec2 a_id;

varying vec2 v_uv;
varying vec2 v_id;
varying vec3 v_pos;
varying float v_W;
varying float v_S;
varying float v_valid;

uniform mat4 u_transform;
uniform vec3 u_basepoint;
uniform vec2 u_resolution;
uniform float u_y_offset;

uniform sampler2D u_H;

const float scale = 0.001;

void main() {
    vec3 e = vec3(1.0 / u_resolution, 0.);

    vec2 SW = texture2D(u_H, a_uv).gb;
    float S = SW.x;
    float W = SW.y;
    
    vec3 displaced = u_basepoint + vec3(0., (S + W + u_y_offset) * scale, 0.);
    vec3 position = a_position + displaced;

    v_uv = a_uv;
    v_id = a_id;
    v_pos = position;   
    v_W = W; 
    v_S = S;

    vec4 view_position = u_transform * vec4(position, 1.0);

    if (W == 0.0) { 
      gl_Position = view_position / 0.0; 
      return;
    } // discard vertex if there's no water...

    gl_Position = view_position;

    // gl_Position = vec4(shifted_pos.xy, 0., 1.);
}