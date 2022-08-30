precision highp float;

varying vec2 v_uv;

uniform vec2 u_p1;
uniform vec2 u_p2;
uniform vec3 u_color;
uniform vec2 u_resolution;

vec2 p1p2_to_mxb(vec2 p1, vec2 p2) {
    float m = (p2.y - p1.y) / (p2.x - p1.x);
    float b = -p1.x * m + p1.y;

    return vec2(m, b);
}

void main() {
    vec2 uv = v_uv;
    vec2 d = 1.0 / u_resolution;

    vec2 mb = p1p2_to_mxb(u_p1, u_p2);
    float m = mb.x;
    float b = mb.y;
    float target_y = uv.x * m + b;
    float dist = abs(target_y - uv.y);

    if (dist < length(d)) {
        gl_FragColor = vec4(u_color, 1.0);
    } else {
        discard;
    }
}