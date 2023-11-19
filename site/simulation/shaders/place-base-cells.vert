precision highp float;

#define FILTER_RANGE 0

attribute vec3 a_position;
attribute vec2 a_uv;
attribute vec2 a_id;
attribute float a_type;

varying vec2 v_uv;
varying vec2 v_id;
varying vec3 v_pos;
varying float v_type;
varying float v_dS;
varying float v_W;

uniform mat4 u_transform;
uniform vec3 u_basepoint;
uniform vec2 u_resolution;

uniform sampler2D u_H;

const float scale = 0.001;
const float epsilon = 0.005;
const float cell_height = 0.0005;
const float half_cell_height = cell_height / 2.0;

void main() {

    vec4 H = texture2D(u_H, a_uv);
    float sediment_t = H.g;
    float sediment_0 = H.a;
    float delta_S = sediment_t - sediment_0;
    v_dS = delta_S;

    /**
     * NOTE(Nic): a_type is always 0.0 for top vertices and 1.0 for bottom vertices,
     * so we can decide how to displace the vertices based on its sign, as below.
     */
    vec3 displaced = u_basepoint + vec3(
      0., sediment_0 * scale + sign(0.5 - a_type) * half_cell_height, 0.
    );

    vec3 position = a_position + displaced;
    
    v_uv = a_uv;
    v_id = a_id;
    v_type = a_type;
    v_pos = position;  
    v_W = H.b;

    gl_Position = u_transform * vec4(position, 1.0);
}