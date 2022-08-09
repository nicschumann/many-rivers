precision highp float;

// #define INCOMPLETE_RIVER

varying vec2 v_uv;

uniform float u_upper_bank;
uniform float u_lower_bank;
uniform float u_bank_width;

uniform float u_sediment_height_max;
uniform float u_sediment_height_min;

uniform vec2 u_resolution;

float sediment_height(vec2 uv)
{
    float cw = 0.05; // channel width

    // float cc = (0.25 * pow(uv.x, 3.)) + 0.5; // channel center: polynomial bank placement.
    float cc = 0.25 * cos(uv.x * 10.) + 0.5;

    float ub = cc - cw * 0.5; // upper bank
    float lb = cc + cw * 0.5; // lower bank

    float SH =
        smoothstep(ub - u_bank_width, ub + u_bank_width, uv.y) *
        (1.0 - smoothstep(lb - u_bank_width, lb + u_bank_width, uv.y));
    
    return SH;
}

void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    vec2 uv = v_uv;

    float y = v_uv.y;
    float x = v_uv.x;

    float BH = 1.0 * (1.0 - uv.x); // 1.0m over 2.5km

    float SH_max = u_sediment_height_max;
    float SH_min = u_sediment_height_min;

    float SH = sediment_height( uv );
    SH = SH_max - SH * (SH_max - SH_min);

    float ubw_w = u_bank_width;

    float WH = sediment_height( uv );
    WH *= (SH_max - SH_min);

    #ifdef INCOMPLETE_RIVER
    if (x >= 1.0 / u_resolution.x ) { WH = 0.; }
    #endif

    gl_FragColor = vec4(
        BH, SH, WH, 1.0
    );
}