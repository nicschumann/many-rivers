precision highp float;

// #define DRAW_BOUNDARY


varying vec2 v_uv;

uniform sampler2D u_H;
uniform vec2 u_resolution;


void main() {
    vec2 uv = v_uv;

    float height = texture2D(u_H, uv).r;

    float max_elev = 10.;
    float min_elev = -3.;
    
    vec3 color_max = vec3(0.9, 0.31, 0.3);
    vec3 color_min = vec3(0.0, 0.3, 0.5);
    vec3 color_bounds = vec3(0.5, 1., 0.);
    
    // just draw the edges to make it easier to see the square.
    #ifdef DRAW_BOUNDARY
    if (uv.x < 1.0 / u_resolution.x) { gl_FragColor = vec4(color_bounds, 1.); return; }
    if (uv.x >= 1.0 - 1.0 / u_resolution.x) { gl_FragColor = vec4(color_bounds, 1.); return; }
    if (uv.y < 1.0 / u_resolution.x) { gl_FragColor = vec4(color_bounds, 1.); return; }
    if (uv.y >= 1.0 - 1.0 / u_resolution.x) { gl_FragColor = vec4(color_bounds, 1.); return; }
    #endif
    
    float t = (height - min_elev) / (max_elev - min_elev);

    gl_FragColor = vec4(t * color_max + (1. - t) * color_min, 1.0);
}