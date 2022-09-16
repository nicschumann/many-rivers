precision highp float;

varying vec2 v_uv;

uniform vec2 u_p1;
uniform vec2 u_p2;
uniform sampler2D u_H;

vec2 p1p2_to_mxb(vec2 p1, vec2 p2) {
    float m = (p2.y - p1.y) / (p2.x - p1.x);
    float b = -p1.x * m + p1.y;

    return vec2(m, b);
}

void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    vec2 uv = vec2(v_uv.x, 1.0 - v_uv.y);
    vec2 mb = p1p2_to_mxb(u_p1, u_p2);

    vec2 p_min = vec2(0., mb.y);
    vec2 p_max = vec2(1.0, mb.x + mb.y);

    if (p_min.y < 0.0) {
        p_min = vec2(-mb.y/mb.x, 0.0);
    } else if (p_min.y > 1.0) {
        p_min = vec2((1.0-mb.y)/mb.x, 1.0);
    }

    if (p_max.y < 0.0) {
        p_max = vec2(-mb.y/mb.x, 0.0);
    } else if (p_max.y > 1.0) {
        p_max = vec2((1.0-mb.y)/mb.x, 1.0);
    }

    float a = uv.x;
    vec2 target_uv = (1.0 - a) * p_min + a * p_max;
    vec4 H = texture2D(u_H, target_uv);
    
    float h_sf = 1.0 / 10.0;
    float SH_norm = ((H.x + H.y) * h_sf);
    float WH_norm = H.z * h_sf;

    // check if we're outside of domain...
    if (target_uv.y < 0.0) { discard; }
    if (target_uv.y > 1.0) { discard; }

    if (uv.y <= SH_norm) {
        
        float gradient_sf = 1.3;
        float a = 1.0 - ((gradient_sf * (SH_norm + WH_norm) - uv.y) / (SH_norm + WH_norm));
        gl_FragColor = vec4(a * vec3(0.65, 0.2, 0.), 1. );


    } else if (uv.y >= SH_norm && uv.y <= SH_norm + WH_norm) {

        float w = H.b;
        const float sf = 5.0;
        vec3 min_color = vec3(0.02, 0.02, 0.02);
        vec3 max_color = vec3(1.0, 0., 0.);
        float fract_w = fract(w * sf);
        float b = 0.2;

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
        discard;
        // gl_FragColor = vec4(vec3(0.), 1.);
    }
}