precision highp float;

// #define DRAW_BOUNDARY


varying vec2 v_uv;

uniform sampler2D u_H;
uniform sampler2D u_N;
uniform vec2 u_resolution;


void main() {
    vec2 uv = v_uv;

    vec4 N = texture2D(u_N, uv);

    gl_FragColor = vec4(N.r / 8.0, N.g / 8.0, 0., 1.); 
}