precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;
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
    float k_vel = 3.0; // max 1. on this regime.
    vec2 d = 1.0 / u_resolution;
    
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.0);

    // calculate slope
    vec2 slope = vec2(
        H(uv + e.xz) - H(uv),
        H(uv + e.zy) - H(uv)
    ) / d.x;

    vec2 flow_depth = vec2(
        max(H(uv), H(uv + e.xz)) - max(BS(uv), BS(uv + e.xz)),
        max(H(uv), H(uv + e.zy)) - max(BS(uv), BS(uv + e.zy))
    );

    vec2 flux = -k_vel * slope * flow_depth;

    gl_FragColor = vec4(flow_depth, flux);
}