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

    vec4 water = vec4(0., 0.75, 0.9, w);

    vec4 terrain = vec4(0.38, 0.31, 0.25, 1.0 - w);
    vec3 h = vec3( b + s );

    if (w > 0.0) { // if it's wet:
        // gl_FragColor = vec4(water.rgb - w / 1.5, 1.0);

        // w = w / 0.5;

        // vec3 min_water = vec3(0., 0., 1.);
        // vec3 max_water = vec3(1., 0., 0.);

        // gl_FragColor = vec4((1.0 - w) * min_water + w * max_water, 1.0);
        const float sf = 5.0;
        vec3 min_color = vec3(0.02, 0.02, 0.02);
        vec3 max_color = vec3(1.0, 0., 0.);
        float fract_w = fract(w * sf);
        float b = 0.2 ;

        if (w < b + 0.1) {
            
            max_color = vec3(0., 0., 1.); // b

        } else if (w < b + 0.2) {
            
            max_color = vec3(0., 1., 1.);

        } else if (w < b + 0.3) {

            max_color = vec3(0., 1., 0.);

        } else if (w < b + 0.4) {
        
            max_color = vec3(1., 1., 0.); // yellow
        
        } else if (w < b + 0.5) {
        
            max_color = vec3(1., 0., 0.);
        
        } else if (w > b + 0.6) {
            
            max_color = vec3(1., 0., 1.);

        }        

        min_color = min_color * max_color;
        gl_FragColor = vec4(max_color * fract_w + min_color * (1. - fract_w), 1.0);

    } else {
        vec3 color = vec3(0.38, 0.31, 0.25);
        gl_FragColor = vec4(h * color, 1.0);
    }    
}