precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;
uniform sampler2D u_Q;
uniform sampler2D u_K;

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

float S(vec2 xy) {
    vec3 h = texture2D(u_H, xy).rgb;
    return h.g;
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
    vec4 H = texture2D(u_H, uv);
    
    vec2 d = vec2(5.0, 5.0);
    float dt = 0.2; // max 0.1

    vec2 flux_lt = vec2(
        flux(uv - e.xz).x,
        flux(uv - e.zy).y
    );
    vec2 flux_rb = flux(uv);

    vec2 lt = flux_lt;
    vec2 rb = flux_rb;

    float total_flux = lt.x + lt.y + -rb.x + -rb.y;
    float W_new = W(uv) + (dt / (d.x * d.y)) * total_flux;

    // depth clamping.
    const float min_water_depth = 0.01;
    if (W_new < min_water_depth) { W_new = 0.0; }

    gl_FragColor = vec4(
        H.r,
        H.g,
        W_new,
        H.a
    );
}