precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;
uniform sampler2D u_K;
uniform sampler2D u_Q;

uniform vec2 u_resolution;


float H(vec2 xy) {
    vec3 h = texture2D(u_H, xy).rgb;
    return h.r + h.g + h.b;
}

float BS(vec2 xy) {
    vec3 h = texture2D(u_H, xy).rgb; 
    return h.r + h.g;
}

float W(vec2 xy) {
    vec3 h = texture2D(u_H, xy).rgb;
    return h.b;
}

vec2 flow_depth(vec2 xy) {
    vec2 fd = texture2D(u_Q, xy).rg;
    return fd;
}

vec2 flux(vec2 xy) {
    vec2 fl = texture2D(u_Q, xy).ba;
    return fl;
}

#define WINDOW_WIDTH 2.0
const float D = pow(WINDOW_WIDTH * 2.0 - 1.0, 2.0) - 3.0;

void main() {
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.);

    vec4 H = texture2D(u_H, uv);
    vec4 K = texture2D(u_K, uv);

    float E = 0.0;
    float W = H.b;
    float S = H.g;
    float k_erosion = 0.00001;

    if (K.a != 0.0) { // edge cell
        float R_norm = K.r;
        E = k_erosion * S * R_norm;
        if (E > 0.) { E *= 2.0; }
    }

    // NOTE(Nic): Don't do anything for now.
    S = min(max(S - E, 0.0), 1.0);
    // W = min(max(0., W + E), 1.0);

    gl_FragColor = vec4(
        H.r,
        S,
        W,
        E
    );
}