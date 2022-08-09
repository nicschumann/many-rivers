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

void main() {
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.);
    
    vec4 new_H = texture2D(u_H, uv);
    gl_FragColor = new_H;
}