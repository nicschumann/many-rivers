precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;
uniform sampler2D u_E;
uniform vec2 u_resolution;


void main() {
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.0);

    vec4 cell = texture2D(u_E, uv);
    float wet = 0.0;
    float dry = 0.0;
    float edges = 0.0;

    if (cell.a > 0.0) {
      // it's an edge cell, we should compute the filter.

      vec4 nw_w = texture2D(u_E, uv - e.zy - e.xz); // northwest cell water
      vec4 no_w = texture2D(u_E, uv - e.zy); // north cell water
      vec4 ne_w = texture2D(u_E, uv - e.zy + e.xz); // northeast cell water
      vec4 ea_w = texture2D(u_E, uv + e.xz); // east cell water
      vec4 se_w = texture2D(u_E, uv + e.zy + e.xz); // southeast cell water
      vec4 so_w = texture2D(u_E, uv + e.zy); // south cell water
      vec4 sw_w = texture2D(u_E, uv + e.zy - e.xz); // southwest cell water
      vec4 we_w = texture2D(u_E, uv - e.xz); // west cell water

      dry = dot(
        (vec4(1.) - vec4(nw_w.r, no_w.r, ne_w.r, ea_w.r)),
        (vec4(1.) - vec4(nw_w.a, no_w.a, ne_w.a, ea_w.a))
      ) + dot(
        (vec4(1.) - vec4(se_w.r, so_w.r, sw_w.r, we_w.r)),
        (vec4(1.) - vec4(se_w.a, so_w.a, sw_w.a, we_w.a))
      );

      wet = dot(
        (vec4(nw_w.r, no_w.r, ne_w.r, ea_w.r)),
        (vec4(1.) - vec4(nw_w.a, no_w.a, ne_w.a, ea_w.a))
      ) + dot(
        (vec4(se_w.r, so_w.r, sw_w.r, we_w.r)),
        (vec4(1.) - vec4(se_w.a, so_w.a, sw_w.a, we_w.a))
      );

      edges = dot(
        vec4(nw_w.a, no_w.a, ne_w.a, ea_w.a), 
        vec4(1.0)
      ) + dot(
        vec4(se_w.a, so_w.a, sw_w.a, we_w.a),
        vec4(1.0)
      );


    }

    gl_FragColor = vec4(dry - wet, edges, cell.a, 0.); 
}