precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;
uniform sampler2D u_K;
uniform sampler2D u_E;
uniform float u_scalefactor;
uniform vec2 u_resolution;
uniform vec2 u_tex_resolution;

void main() {
    vec2 uv = v_uv;
    vec4 curvature = texture2D(u_K, uv);
    vec4 downsampling = texture2D(u_E, uv);
    float water = texture2D(u_H, uv).b;    

    if (downsampling.r == 1.0 && downsampling.a == 1.0) {
      // error: cell is wet and a boundary cell...
      gl_FragColor = vec4(1., 0., 0, 1.);

    } else if (downsampling.r == 1.0 || downsampling.a == 1.0) {
      // cell is an edge:
      gl_FragColor = vec4(1., 1., 1., 1.);

      float k = curvature.r / (8. - curvature.g);


      if (k > 0.0) {
        gl_FragColor = vec4(k, 0., 0., 1.);
      } else if (k == 0.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.);
      } else {
        gl_FragColor = vec4(0., -k, 0., 1.);
      }

    } else {

      discard;
    }


    // if (water > 0.0 && curvature == 0.0) {
    //   gl_FragColor = vec4(0., 0., 1., 1.);
    // } else if (water == 0.0 && curvature == 1.0) {
    //   gl_FragColor = vec4(curvature);
    // } else if (water > 0.0 && curvature == 1.0) {
    //   gl_FragColor = vec4(1., 0., 0., 1.);
    // } else {
    //   discard;
    // }

    

    // if (edge == 0.) { discard; }

    // if (curvature > 2.0) {
    //   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    // } else if (curvature > 0.0) {
    //   gl_FragColor = vec4(0.6, 0.3, 0.0, 1.0);
    // } else if (curvature == 0.0) {
    //   gl_FragColor = vec4(0.3, 0.3, 0.3, 1.0);
    // } else if (curvature > -2.0) {
    //   gl_FragColor = vec4(0.0, 0.3, 0.6, 1.0);
    // } else {
    //   gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
    // }
}