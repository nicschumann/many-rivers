precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;
uniform vec2 u_resolution;

float H(vec2 xy) {
    vec3 h = texture2D(u_H, xy).rgb;
    return h.r + h.g + h.b;
}


void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    vec2 d = 1.0 / u_resolution;
    
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.0);

    // calculate slope
    vec2 slope = vec2(
        H(uv + e.xz) - H(uv),
        H(uv + e.zy) - H(uv)
    ) / d.x;

    gl_FragColor = vec4(slope, 0., 1.);
}