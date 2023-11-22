precision highp float;

varying vec2 v_uv;

uniform highp sampler2D u_elevation;
uniform sampler2D u_boundary;
uniform float u_water_depth;

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

    float BH = 1.0; // 1.0m over 2.5km

    vec4 rgba = texture2D(u_elevation, v_uv);
    float SH = sediment_height(v_uv);
    
    float WH = 0.0;
    float mask = texture2D(u_boundary, uv).a;

    if (mask > 0.0) { WH = u_water_depth; }

    // gl_FragColor = rgba;

    gl_FragColor = vec4(
        BH, SH, WH, SH
    );
}