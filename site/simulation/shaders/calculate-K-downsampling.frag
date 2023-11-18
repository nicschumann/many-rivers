precision highp float;

#define FILTER_RANGE 3 // this should be set to half the downsampling factor in the project constants.

varying vec2 v_uv;

uniform sampler2D u_H;
uniform vec2 u_resolution;
uniform vec2 u_sim_resolution;

const float u_saturation_point = 0.0;

// This shader reprojects the state of the domain
// onto a lower-resolution shader so that we can sample 
// the lower-res space properly.

void main() {
  vec2 uv = v_uv;
  vec2 e = 1.0 / u_sim_resolution;

  float dry = 0.0;
  float wet = 0.0;
  float is_wet = 0.0;

  for (int i = -FILTER_RANGE; i < FILTER_RANGE + 1; i++) {
      for (int j = -FILTER_RANGE; j < FILTER_RANGE + 1; j++) {

          vec2 offset = vec2(float(i), float(j)) * e.xy;
          float water = texture2D(u_H, uv + offset).b;

          if (water == 0.0) {
            dry += 1.0;
          } else {
            wet += 1.0;
          }
      }
  }

  if (wet > (dry)) { is_wet = 1.0; }

  gl_FragColor = vec4(is_wet, wet, dry, 0.); 
}