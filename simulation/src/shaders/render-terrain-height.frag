precision highp float;

// #define ALPHA_BLEND

varying vec2 v_uv;

uniform sampler2D u_H;
uniform float u_scalefactor;

void main() {
    vec2 uv = v_uv;

    vec3 H = texture2D(u_H, uv).rgb;
    
    float b = H.r;
    float s = H.g;
    float w = H.b;

    vec4 water = vec4(0., 0.25, 0.6, w);

    vec4 terrain = vec4(0.38, 0.31, 0.25, 1.0 - w);
    vec3 height = vec3( pow((b + s) * u_scalefactor, 0.78) );

    #ifdef ALPHA_BLEND // define ALPHA_BLEND at the top to blend water in to simulate depth

    gl_FragColor = vec4(water.rgb * water.a + (terrain.rgb * height) * terrain.a, 1.0);

    #else // otherwise use a bright, hard edge (easier to debug?)

    if (w > 0.0) { // if it's wet:
        gl_FragColor = vec4(water.rgb - w, 1.0);
    } else {
        vec3 height = vec3( pow((b + s) * u_scalefactor, 0.78) );
        vec3 color = vec3(0.38, 0.31, 0.25);
        gl_FragColor = vec4(height * color, 1.0);
    }

    #endif
    
}