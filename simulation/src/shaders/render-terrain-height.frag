precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;
uniform float u_scalefactor;

void main() {
    vec2 uv = v_uv;

    vec3 H = texture2D(u_H, uv).rgb;
    
    float b = H.r;
    float s = H.g;
    float w = H.b;

    if (w > 0.0) { // if it's wet:
        gl_FragColor = vec4(vec2(0.), (b + s + w) * u_scalefactor, 1.0);
    } else {
        gl_FragColor = vec4(vec3(b + s) * u_scalefactor, 1.0);
    }
    
}