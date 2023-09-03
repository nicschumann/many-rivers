precision highp float;

varying vec2 v_uv;

uniform sampler2D u_Q;
uniform sampler2D u_boundary;

uniform vec2 u_resolution;

void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    float k_vel = 0.005;

    vec2 uv = v_uv;
    vec2 flow_depth = texture2D(u_Q, uv).rg;
    vec2 flux = texture2D(u_Q, uv).ba;
    vec4 mask = texture2D(u_boundary, uv);

    if (mask.a <= 0.) {
        
        // pass through, not a boundary...
        gl_FragColor = gl_FragColor = vec4(
            flow_depth, flux
        );

    } else {
        
        if (mask.r > 0.0) {
            // should be an inflow...

            vec2 slope = -1.0 * normalize(vec2(0.5) - uv);
            vec2 new_flux = -k_vel * slope * flow_depth;

            gl_FragColor = gl_FragColor = vec4(
                flow_depth, flux
            );


        } else if (mask.b > 0.0) {
            // should be an outflow...
            vec2 slope = -1.0 * normalize(uv - vec2(0.5));
            vec2 new_flux = -k_vel * slope * flow_depth;

            gl_FragColor = gl_FragColor = vec4(
                flow_depth, flux
            );

        } else {

            // unrecognized boundary condition, pass through...
            gl_FragColor = gl_FragColor = vec4(
                flow_depth, flux
            );

        }

    } 
}