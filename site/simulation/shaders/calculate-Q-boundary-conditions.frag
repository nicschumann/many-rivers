precision highp float;

varying vec2 v_uv;

uniform sampler2D u_Q;

uniform float u_upper_bank;
uniform float u_lower_bank;
uniform float u_bank_width;

uniform float u_sediment_height_max;
uniform float u_sediment_height_min;

uniform vec2 u_resolution;

void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    float k_vel = 0.1;

    vec2 uv = v_uv;
    vec2 flow_depth = texture2D(u_Q, uv).rg;
    vec2 flux = texture2D(u_Q, uv).ba;

    // float SH_max = u_sediment_height_max;
    // float SH_min = u_sediment_height_min;
    // float ubw_w = u_bank_width;

    // float incoming_water = 
    //     smoothstep(u_upper_bank - ubw_w, u_upper_bank + ubw_w, uv.y) *
    //     (1.0 - smoothstep(u_lower_bank - ubw_w, u_lower_bank + ubw_w, uv.y)) *
    //     (SH_max - SH_min);

    if (uv.x <= 1.0 / u_resolution.x ) {

        vec2 slope = vec2(-1.0, 0.0);

        vec2 new_flux = -k_vel * slope * flow_depth;

        gl_FragColor = vec4(
            flow_depth, new_flux
        );

    } else if (uv.x >= 1.0 - (1.0 / u_resolution.x) || uv.y >= 1.0 - (1.0 / u_resolution.y)) {

        vec2 slope = vec2(-1.0, 0.0);

        vec2 new_flux = -k_vel * slope * flow_depth;

        gl_FragColor = vec4(
            flow_depth, new_flux
        );

    } else {
        gl_FragColor = vec4(
            flow_depth, flux
        );
    } 
}