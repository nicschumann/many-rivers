precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;
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
    vec2 d = 1.0 / u_resolution;

    vec4 H = texture2D(u_H, uv);
    float mask = texture2D(u_boundary, uv).a;

    // the amount of water to pump through the system.
    float incoming_water = 0.3; // smarter way to set this, pls.

    if ((uv.x >= 1.0 - d.x ||
        uv.x <= d.x ||
        uv.y >= 1.0 - d.y ||
        uv.y <= d.y) && mask > 0.) { // add inflow where the channel is.
        
        gl_FragColor = vec4(
            H.r, H.g, min(H.b + incoming_water, 0.2), H.a
        );

    } else if (
        (uv.x >= 1.0 - d.x ||
        uv.x <= d.x ||
        uv.y >= 1.0 - d.y ||
        uv.y <= d.y) && // we're on an edge
        mask == 0. // it's not a source
    )  { // add outflows at edges.
        
        // incoming_water = 0.0;
        gl_FragColor = vec4(
            H.r, H.g, max(0., H.b - incoming_water), H.a
        );
    
    } else {
        
        float WH = H.b; // constant drain / evap.
        if (WH < 0.00001) { WH = 0.0; }
        
        // drain some water here?
        WH -= 0.000005;

        gl_FragColor = vec4(
            H.r, H.g, max(0., WH), H.a
        );
    } 
}