precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;
uniform float u_scalefactor;

void main() {
    vec2 uv = v_uv;

    vec4 H = texture2D(u_H, uv);

    const float sf = 100000.0; // should be 1 / k_erosion

    if (H.a > 0.) {
        gl_FragColor = vec4(H.a * sf, 0., 0., 1.0);
    } else if (H.a < 0.) {
        gl_FragColor = vec4(0., -H.a * sf, 0., 1.0);
    } else {
        discard;
    }
}