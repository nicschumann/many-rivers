precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;
uniform sampler2D u_S;
uniform vec2 u_resolution;

float H(vec2 xy) {
    vec3 h = texture2D(u_H, xy).rgb;
    return h.r + h.g + h.b;
}

float BS(vec2 xy) {
    vec3 h = texture2D(u_H, xy).rgb;
    return h.r + h.g;
}

void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    float k_vel = 0.1; // max 1. on this regime.
    vec2 d = 1.0 / u_resolution;
    
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.0);

    // calculate slope
    vec2 slope = texture2D(u_S, uv).rg;

    vec2 flow_depth = vec2(
        max(H(uv), H(uv + e.xz)) - max(BS(uv), BS(uv + e.xz)),
        max(H(uv), H(uv + e.zy)) - max(BS(uv), BS(uv + e.zy))
    );

    float k = 0.01;
    float n = 0.2;

    // vec2 flux = -k_vel * slope * flow_depth;

    vec2 flux = vec2(0.0);
    float min_flow_depth = 0.01;

    if (flow_depth.x > min_flow_depth) {
        // flux.x = -k_vel * slope.x * flow_depth.x;
        flux.x = (-k / n) * sign(slope.x) * sqrt(abs(slope.x)) * pow(flow_depth.x, 0.66667);
    }

    if (flow_depth.y > min_flow_depth) {
        // flux.y = -k_vel * slope.y * flow_depth.y;
        flux.y = (-k / n) * sign(slope.y) * sqrt(abs(slope.y)) * pow(flow_depth.y, 0.66667);   
    }

    // vec2 flux = (-k / n) * sign(slope) * sqrt(abs(slope)) * pow(flow_depth, vec2(0.66667));

    // flux /= flux_norm;

    gl_FragColor = vec4(flow_depth, flux);
}