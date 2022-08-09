precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;

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
    vec2 d = 1.0 / u_resolution;

    vec4 H = texture2D(u_H, uv);

    float SH_max = u_sediment_height_max;
    float SH_min = u_sediment_height_min;
    float ubw_w = u_bank_width;

    float flood_scale_factor = 1.05; 

    float incoming_water = 
        sediment_height( uv ) *
        (SH_max - SH_min) * flood_scale_factor;

    if (uv.x <= d.x ) { // add inflow where the channel is.
        gl_FragColor = vec4(
            H.r, H.g, incoming_water, H.a
        );
    } else if (uv.x >= 1.0 - d.x)  { // add an outflow at each edge...
        gl_FragColor = vec4(
            H.r, H.g, max(0., H.b - incoming_water), H.a
        );
    } else {
        
        float WH = H.b;
        if (WH < 0.00001) { WH = 0.0; }

        gl_FragColor = vec4(
            H.r, H.g, WH, H.a
        );
    } 
}