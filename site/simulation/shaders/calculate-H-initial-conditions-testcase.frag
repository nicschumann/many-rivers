precision highp float;

// #define INCOMPLETE_RIVER

varying vec2 v_uv;

uniform sampler2D u_elevation;
uniform vec2 u_resolution;

void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    vec2 uv = v_uv;

    float BH = 2.0 * (1.0 - uv.x); // 1.0m over 2.5km
    float SH = 0.0;
    float WH = 0.0;

    float mask = texture2D(u_elevation, uv).a;

    if (mask == 1.0) {
        SH = 6.0;
    } else {
        SH = 10.0;
    }

    if (mask == 1.0) { 
        WH = 3.7;
    }

    gl_FragColor = vec4(
        BH, SH, WH, SH
    );
}