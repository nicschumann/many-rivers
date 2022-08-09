precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;
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

void main() {
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.0);

    float c = texture2D(u_H, uv).b;

    // this cell is wet; skip it.
    if (c > 0.0) { 
        gl_FragColor = vec4(0.); 
        return;
    }

    float t = texture2D(u_H, uv - e.zy).b;
    float l = texture2D(u_H, uv - e.xz).b;
    float b = texture2D(u_H, uv + e.zy).b;
    float r = texture2D(u_H, uv + e.xz).b;

    if (t + l + b + r > 0.0) {
        gl_FragColor = vec4(0., 1., 0., 1.);
    } else {
        gl_FragColor = vec4(0.); 
    }
}