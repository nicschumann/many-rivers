precision highp float;

#define M_PI 3.14159265359
// #define TOTAL_FLUX

varying vec2 v_uv;

uniform sampler2D u_Q;
uniform sampler2D u_H;
uniform float u_scalefactor;
uniform float u_flux_magnitude_scale;
uniform vec2 u_resolution;

vec2 flux(vec2 xy) {
    vec2 fl = texture2D(u_Q, xy).ba;
    return fl;
}

void main() {
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.);
    
    vec4 Q = texture2D(u_Q, uv);
    vec4 H = texture2D(u_H, uv);
    if (H.b <= 0.) { discard; }


    #ifdef TOTAL_FLUX

        vec2 flux_lt = vec2(
            flux(uv - e.xz).x,
            flux(uv - e.zy).y
        );
        vec2 flux_rb = flux(uv);

        vec2 lt = flux_lt;
        vec2 rb = flux_rb;
    
        float total_flux = lt.x + lt.y + -rb.x + -rb.y;

        if (total_flux > 0.0) {

            gl_FragColor = vec4(total_flux * u_flux_magnitude_scale, 0.0, 0.0, 1.0);

        } else if (total_flux < 0.0) {

            gl_FragColor = vec4(0.0, -total_flux * u_flux_magnitude_scale, 0.0, 1.0);

        } else {
            gl_FragColor = vec4(vec3(0.0), 1.0);
        }

    #else 

        vec2 flow_depth = Q.rg;
        vec2 flux = Q.ba;
        vec2 flux_norm = normalize(flux);   

        gl_FragColor = vec4(vec3(length(flux) * u_flux_magnitude_scale), 1.0);

    #endif 



    




    // NOTE(Nic): render the angle of the slope vector
    // assuming its stored in the first 2 channels of the Q tex

    // vec2 Q = texture2D(u_Q, uv).rg;
    // vec2 Q_norm = normalize(Q);
    
    // float mag = length(Q.xy)m;
    // float angle = acos(Q_norm.x);

    // if (Q.y < 0.0) { angle = M_PI - (angle + M_PI); }
    // angle += M_PI * 1.5;
    // float hue = (angle / M_PI) / 2.0;

    // gl_FragColor = vec4(hsl2rgb(vec3(hue, mag, 0.5)), 1.0);
}