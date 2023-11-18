precision highp float;

varying vec2 v_uv;

uniform sampler2D u_K;
uniform sampler2D u_E;
uniform vec2 u_resolution;


void main() {
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.0);

    vec4 cell = texture2D(u_K, uv);
    float avg = 0.0;
    float edges = 0.0;

    if (cell.b > 0.0) {
      // it's an edge cell, we should compute the filter.

      vec4 nw_k = texture2D(u_K, uv - e.zy - e.xz); // northwest cell water
      vec4 no_k = texture2D(u_K, uv - e.zy); // north cell water
      vec4 ne_k = texture2D(u_K, uv - e.zy + e.xz); // northeast cell water
      vec4 ea_k = texture2D(u_K, uv + e.xz); // east cell water
      vec4 se_k = texture2D(u_K, uv + e.zy + e.xz); // southeast cell water
      vec4 so_k = texture2D(u_K, uv + e.zy); // south cell water
      vec4 sw_k = texture2D(u_K, uv + e.zy - e.xz); // southwest cell water
      vec4 we_k = texture2D(u_K, uv - e.xz); // west cell water

      avg = dot(
        vec4(nw_k.r, no_k.r, ne_k.r, ea_k.r), 
        vec4(nw_k.b, no_k.b, ne_k.b, ea_k.b)
      ) + dot(
        vec4(se_k.r, so_k.r, sw_k.r, we_k.r), 
        vec4(se_k.b, so_k.b, sw_k.b, we_k.b)
      );

      avg += cell.r;
      avg /= cell.g;
    }

    gl_FragColor = vec4(avg, cell.gba); 
}