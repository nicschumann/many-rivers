precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;
uniform float u_scalefactor;

void main() {
    vec2 uv = v_uv;

    vec4 H = texture2D(u_H, uv);
    
    float b = H.r;
    float s = H.g;
    float w = H.b;

    vec4 water = vec4(0., 0.25, 0.6, w);

    vec4 terrain = vec4(0.38, 0.31, 0.25, 1.0 - w);

    if (w > 0.0) { // if it's wet:
        gl_FragColor = vec4(water.rgb - w, 1.0);
    } else {
        vec3 height = vec3( b + s );
        vec3 color = vec3(0.38, 0.31, 0.25);
        gl_FragColor = vec4(height * color, 1.0);
    }    
}