precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;
uniform sampler2D u_K;
uniform float u_scalefactor;
uniform vec2 u_resolution;

void main() {
    vec2 uv = v_uv;
    
    vec4 H = texture2D(u_H, uv);
    vec4 color = texture2D(u_K, uv);
    if ( color.a == 0. && H.b == 0. ) { discard; }

    const float sf = 5.0;
    if (color.r > 0.0) {
        gl_FragColor = vec4(color.r * sf, 0., 0., 1.);
    } else {
        gl_FragColor = vec4(0., -color.r * sf, 0., 1.);
    }
}