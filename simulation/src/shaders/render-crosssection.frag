precision highp float;

varying vec2 v_uv;

uniform vec2 u_p1;
uniform vec2 u_p2;
uniform sampler2D u_H;

vec2 p1p2_to_mxb(vec2 p1, vec2 p2) {
    float m = (p2.y - p1.y) / (p2.x - p1.x);
    float b = -p1.x * m + p1.y;

    return vec2(m, b);
}

void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    vec2 uv = vec2(v_uv.x, 1.0 - v_uv.y);
    vec2 mb = p1p2_to_mxb(u_p1, u_p2);

    vec2 p_min = vec2(0., mb.y);
    vec2 p_max = vec2(1.0, mb.x + mb.y);

    if (p_min.y < 0.0) {

        p_min = vec2(-mb.y/mb.x, 0.0);

    } else if (p_min.y > 1.0) {
        p_min = vec2((1.0-mb.y)/mb.x, 1.0);
    }

    if (p_max.y < 0.0) {
        p_max = vec2(-mb.y/mb.x, 0.0);
    } else if (p_max.y > 1.0) {
        p_min = vec2((1.0-mb.y)/mb.x, 1.0);
    }

    float a = uv.x;
    vec2 target_uv = (1.0 - a) * p_min + a * p_max;
    // vec2 target_uv = vec2(uv.x, uv.x * mb.x + mb.y);
    vec4 H = texture2D(u_H, target_uv);
    
    float h_sf = 1.0 / 10.0;
    float SH_norm = ((H.x + H.y) * h_sf);
    float WH_norm = H.z * h_sf;

    // check if we're outside of domain...
    if (target_uv.y < 0.0) { discard; }
    if (target_uv.y > 1.0) { discard; }

    if (uv.y <= SH_norm) {
        gl_FragColor = vec4(vec3(0.65, 0.2, 0.), 1. );
    } else if (uv.y >= SH_norm && uv.y <= SH_norm + WH_norm) {
        gl_FragColor = vec4(vec3(0., 0.2, 1.), 1.);
    } else {
        discard;
        // gl_FragColor = vec4(vec3(0.), 1.);
    }
}