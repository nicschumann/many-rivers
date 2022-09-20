precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;
uniform vec2 u_resolution;

float BS(vec2 xy) {
    vec2 h = texture2D(u_H, xy).rg;
    return h.r + h.g;
}

float H(vec2 xy) {
    vec3 h = texture2D(u_H, xy).rgb;
    return h.r + h.g + h.b;
}


void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    vec2 d = 1.0 / u_resolution;
    
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.0);

    // calculate hydralic slope
    vec2 hydraulic_slope = vec2(
        H(uv + e.xz) - H(uv),
        H(uv + e.zy) - H(uv)
    ) / d.x;

    // calculate sediment slope
    vec2 sediment_slope = vec2(
        BS(uv + e.xz) - BS(uv),
        BS(uv + e.zy) - BS(uv)
    ) / d.x;



    gl_FragColor = vec4(hydraulic_slope, sediment_slope);
}