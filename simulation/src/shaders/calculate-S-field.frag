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

vec2 get_haudraulic_slope(vec2 uv) {
    vec2 d = 1.0 / u_resolution;
    vec3 e = vec3(d, 0.0);

    float h11 = H(uv - e.xy       );
    float h13 = H(uv - e.zy       );
    float h12 = H(uv + e.xz - e.zy);

    float h21 = H(uv - e.xz       );
    // h22 == self
    float h23 = H(uv + e.xz       );

    float h31 = H(uv - e.xz + e.zy);
    float h33 = H(uv + e.zy       );
    float h32 = H(uv + e.xy       );

    float dfdx = h13 + h23 + h33 - h11 - h21 - h31;
    dfdx /= 6.0 * d.x;

    float dfdy = h31 + h32 + h33 - h11 - h12 - h13;
    dfdy /= 6.0 * d.y;

    return vec2(dfdx, dfdy);
}

vec2 get_sediment_slope(vec2 uv) {
    const float dx = 5.0;

    vec2 d = 1.0 / u_resolution;
    vec3 e = vec3(d, 0.0);


    float h11 = BS(uv - e.xy       );
    float h13 = BS(uv - e.zy       );
    float h12 = BS(uv + e.xz - e.zy);

    float h21 = BS(uv - e.xz       );
    // h22 == self
    float h23 = BS(uv + e.xz       );

    float h31 = BS(uv - e.xz + e.zy);
    float h33 = BS(uv + e.zy       );
    float h32 = BS(uv + e.xy       );

    float dfdx = h13 + h23 + h33 - h11 - h21 - h31;
    dfdx /= 6.0 * d.x;

    float dfdy = h31 + h32 + h33 - h11 - h12 - h13;
    dfdy /= 6.0 * d.y;

    return vec2(dfdx, dfdy);
}


void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    vec2 d = 1.0 / u_resolution;
    
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.0);

    // calculate hydralic slope
    // NOTE(Nic): v1
    vec2 hydraulic_slope = vec2(
        H(uv + e.xz) - H(uv),
        H(uv + e.zy) - H(uv)
    ) / d.x;

    // vec2 hydraulic_slope = get_haudraulic_slope(uv);

    // calculate sediment slope
    vec2 sediment_slope = vec2(
        BS(uv + e.xz) - BS(uv),
        BS(uv + e.zy) - BS(uv)
    ) / d.x;

    // vec2 sediment_slope = get_sediment_slope(uv);


    gl_FragColor = vec4(hydraulic_slope, sediment_slope);
}