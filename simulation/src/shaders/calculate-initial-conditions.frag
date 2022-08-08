precision highp float;

varying vec2 v_uv;

uniform float u_upper_bank;
uniform float u_lower_bank;
uniform float u_bank_width;

uniform float u_sediment_height_max;
uniform float u_sediment_height_min;

uniform vec2 u_resolution;

void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    float y = v_uv.y;
    float x = v_uv.x;

    float BH = (1.0 - x); // 1.0m over 2.5km

    float SH_max = u_sediment_height_max;
    float SH_min = u_sediment_height_min;

    float SH =
        smoothstep(u_upper_bank - u_bank_width, u_upper_bank + u_bank_width, y) *
        (1.0 - smoothstep(u_lower_bank - u_bank_width, u_lower_bank + u_bank_width, y));

    SH = SH_max - SH * (SH_max - SH_min);

    float ubw_w = u_bank_width;

    float WH = 
        smoothstep(u_upper_bank - ubw_w, u_upper_bank + ubw_w, y) *
        (1.0 - smoothstep(u_lower_bank - ubw_w, u_lower_bank + ubw_w, y)) *
        (SH_max - SH_min);

    if (x >= 1.0 / u_resolution.x ) { WH = 0.; }

    gl_FragColor = vec4(
        BH, SH, WH, 1.0
    );
}