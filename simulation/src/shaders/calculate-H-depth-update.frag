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
    
    vec2 d = vec2(5.0, 5.0);
    float dt = 0.1; // max 0.1

    vec2 flow_depth_lt = vec2(
        flow_depth(uv - e.xz).x,
        flow_depth(uv - e.zy).y
    );
    vec2 flow_depth_rb = flow_depth(uv);

    vec2 flux_lt = vec2(
        flux(uv - e.xz).x,
        flux(uv - e.zy).y
    );
    vec2 flux_rb = flux(uv);

    vec2 lt = flow_depth_lt * flux_lt;
    vec2 rb = flow_depth_rb * flux_rb;

    float total_flux = lt.x + lt.y + -rb.x + -rb.y;
    float W_new = W(uv) + (dt / (d.x * d.y)) * total_flux;

    // vec2 u = lt - rb;
    // float k = texture2D(u_K, uv).r;
    // // float S_new = (S(uv) - S(uv - normalize(u) * e.xy)) * total_flux * k;
    // float E = S(uv) * total_flux * -k * 0.01;
    // float S_new = S(uv) + E;
    // W_new = W_new - E;
    
    // // try just flooring itf?
    // if (k < -0.02 && W_new < 0.01) { W_new = 0.0; }

    vec4 all_height_data = texture2D(u_H, uv);

    gl_FragColor = vec4(
        all_height_data.r,
        all_height_data.g,
        W_new,
        all_height_data.a
    );
}