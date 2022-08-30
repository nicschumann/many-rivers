precision highp float;

// #define DRAW_BOUNDARY


varying vec2 v_uv;

uniform sampler2D u_H;
uniform vec2 u_resolution;


void main() {
    vec2 uv = v_uv;

    vec4 H = texture2D(u_H, uv);
    float s = H.r;
    float w = H.g;

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
    
    float t = (s - min_elev) / (max_elev - min_elev);
    vec3 terrain_color = t * color_max + (1. - t) * color_min;

    vec3 water_color = vec3(0.04, 0.1, 0.9);

    if (w > 0.) {
        gl_FragColor = vec4(water_color * (1.0 - w), 1.);
    } else {
        gl_FragColor = vec4(terrain_color, 1.0);
    }
}