precision highp float;

// #define INCOMPLETE_RIVER

varying vec2 v_uv;

uniform sampler2D u_elevation;
uniform sampler2D u_boundary;

uniform float u_upper_bank;
uniform float u_lower_bank;
uniform float u_bank_width;

uniform float u_sediment_height_max;
uniform float u_sediment_height_min;

uniform vec2 u_resolution;

float sediment_height(vec2 uv)
{
    vec3 rgb = texture2D(u_elevation, uv).rgb;
    float e = -10000.0 + ((rgb.r * 255.0 * 256.0 * 256.0 + rgb.g * 255.0 * 256.0 + rgb.b * 255.0) * 0.1);

    return e;
}


void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    vec2 uv = v_uv;

    float BH = 1.0 * (1.0 - uv.x); // 1.0m over 2.5km

    float SH = sediment_height(v_uv) * 0.2;
    
    float WH = 0.0;
    float mask = texture2D(u_boundary, uv).a;
    if (mask > 0.0) { WH = 0.3 * (1.0 - uv.x); }


    #ifdef INCOMPLETE_RIVER
    if (uv.x >= 1.0 / u_resolution.x ) { WH = 0.; }
    #endif


    gl_FragColor = vec4(
        BH, SH, WH, 0.0
    );
}