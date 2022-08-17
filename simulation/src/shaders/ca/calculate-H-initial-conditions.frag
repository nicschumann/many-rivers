precision highp float;

varying vec2 v_uv;

uniform sampler2D u_elevation;
uniform sampler2D u_boundary;

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

    float SH = sediment_height(uv);
    
    float WH = 0.0;
    float mask = texture2D(u_boundary, uv).a;
    
    // water height of 1 meter
    if (mask > 0.0) { WH = 1.0; } 


    gl_FragColor = vec4(
        SH, WH, 0., 1.
    );
}