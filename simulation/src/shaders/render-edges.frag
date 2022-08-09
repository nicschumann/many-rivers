precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;
uniform float u_scalefactor;
uniform vec2 u_resolution;

void main() {
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.0);

    float c = texture2D(u_H, uv).b;

    // this cell is wet; skip it.
    if (c > 0.0) { discard; }

    float t = texture2D(u_H, uv - e.zy).b;
    float l = texture2D(u_H, uv - e.xz).b;
    float b = texture2D(u_H, uv + e.zy).b;
    float r = texture2D(u_H, uv + e.xz).b;

    if (t + l + b + r > 0.0) {
        gl_FragColor = vec4(1., 0., 0., 1.);
    } else {
        discard;
    }
}