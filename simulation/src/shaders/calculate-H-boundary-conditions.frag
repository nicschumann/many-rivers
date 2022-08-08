precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;

uniform float u_upper_bank;
uniform float u_lower_bank;
uniform float u_bank_width;

uniform float u_sediment_height_max;
uniform float u_sediment_height_min;

uniform vec2 u_resolution;

void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    vec2 uv = v_uv;
    vec4 H = texture2D(u_H, uv);

    float SH_max = u_sediment_height_max;
    float SH_min = u_sediment_height_min;
    float ubw_w = u_bank_width;

    float incoming_water = 
        smoothstep(u_upper_bank - ubw_w, u_upper_bank + ubw_w, uv.y) *
        (1.0 - smoothstep(u_lower_bank - ubw_w, u_lower_bank + ubw_w, uv.y)) *
        (SH_max - SH_min);

    if (uv.x <= 1.0 / u_resolution.x ) {
        gl_FragColor = vec4(
            H.r, H.g, incoming_water, H.a
        );
    } else {
        gl_FragColor = vec4(
            H.r, H.g, H.b, H.a
        );
    } 
}