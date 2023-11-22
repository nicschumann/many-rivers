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
     * NOTE(Nic): Use invalid division trick to bail out of the pipeline
     * for verts we don't want to render in delta passes.
     */
    if (abs(delta_S) < epsilon) {
      gl_Position = vec4(0.0) / 0.0;
      return;
    }


    vec3 displaced = u_basepoint;

    /**
     * NOTE(Nic): There's a faster, non-branching way to express this...
     */
    if (a_type == 0.0) { // top face...
      if (delta_S > epsilon) {
        // we have accreted material here, so the top should reflect the amount of accreted material
        displaced += vec3(0., sediment_0 * scale + half_cell_height + delta_S * scale, 0.);
      } else if (delta_S < -epsilon) {
        // we have eroded material here, so the top should be the bottom of the reference volume.
        displaced += vec3(0., sediment_0 * scale - half_cell_height, 0.);
      } else { // zero case
        // nothing has happened here, so the top should be the top of the reference volume.
        displaced += vec3(0., sediment_0 * scale + half_cell_height, 0.);
      }
      
      
    } else if (a_type == 1.0) { // bottom face...
      if (delta_S > epsilon) {
        // we have accreted material here, so the bottom of this cell should be the top of the neutral range...
        displaced += vec3(0., sediment_0 * scale + half_cell_height, 0.);
      } else if (delta_S < -epsilon) {
        // we have lost volume here, so the bottom of the cell should reflect the amount of removed material.
        displaced += vec3(0., sediment_0 * scale + half_cell_height + delta_S * scale, 0.);
      } else { // zero case
        // "nothing" has happened here, so the bottom should be the bottom of the reference volume.
        displaced += vec3(0., sediment_0 * scale - half_cell_height, 0.);
      }
    }

    vec3 position = a_position + displaced;
    
    v_uv = a_uv;
    v_id = a_id;
    v_type = a_type;
    v_pos = position;  
    v_W = H.b;

    gl_Position = u_transform * vec4(position, 1.0);
}