precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;
uniform sampler2D u_K;
uniform sampler2D u_Q;

uniform vec2 u_resolution;


float H(vec2 xy) {
    vec3 h = texture2D(u_H, xy).rgb;
    return h.r + h.g + h.b;
}

float BS(vec2 xy) {
    vec3 h = texture2D(u_H, xy).rgb; 
    return h.r + h.g;
}

float W(vec2 xy) {
    vec3 h = texture2D(u_H, xy).rgb;
    return h.b;
}

vec2 flow_depth(vec2 xy) {
    vec2 fd = texture2D(u_Q, xy).rg;
    return fd;
}

vec2 flux(vec2 xy) {
    vec2 fl = texture2D(u_Q, xy).ba;
    return fl;
}

void main() {
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.);
    vec4 H = texture2D(u_H, uv);
    
    const float k_bed = 0.005;

    const float Q_threshold_high = 0.8;
    const float Q_threshold_low = 0.03;

    float Q_local = length( texture2D(u_Q, uv).ba );
    float E = 0.;

    if (H.b > 0.0) {
        if (Q_local > Q_threshold_high) {
            
            E = k_bed * (Q_threshold_high - Q_local);
            
        } else if (Q_local < Q_threshold_low) {
            
            E = k_bed * (Q_threshold_low - Q_local);
        
        }
    }

    gl_FragColor = vec4(
        H.r,
        min(max(0., H.g + E), 1.1),
        // H.g,
        H.b,
        E
    );
}