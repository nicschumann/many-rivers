precision highp float;

#define M_PI 3.14159265359
#define NORMALIZE_FLUX
// #define RENDER_FLUX_MAGNITUDE

varying vec2 v_uv;

uniform sampler2D u_Q;
uniform sampler2D u_H;
uniform float u_scalefactor;

vec3 hsl2rgb( in vec3 c ){
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0,1.0);
    return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}

void main() {
    vec2 uv = v_uv;
    
    vec4 Q = texture2D(u_Q, uv);
    vec4 H = texture2D(u_H, uv);
    if (H.b <= 0.) { discard; }

    vec2 flow_depth = Q.rg;
    vec2 flux = Q.ba;
    vec2 flux_norm = normalize(flux);
    
    // magnitude
    // gl_FragColor = vec4(length(flow_depth) * 10., 0., 0., 1.);

    #ifdef NORMALIZE_FLUX
    
    float mag = length(flux_norm);
    float angle = acos(flux_norm.x / mag);
    float y = flux_norm.y;

    #else
    
    float mag = length(flux);
    float angle = acos(flux.x / mag);
    float y = flux.y;

    #endif

    if (y < 0.0) { angle = M_PI - (angle + M_PI); }
    angle += M_PI * 1.5;
    float hue = (angle / M_PI) / 2.0;

    #ifdef RENDER_FLUX_MAGNITUDE
    gl_FragColor = vec4(vec3(length(flux)), 1.0);
    #else
    gl_FragColor = vec4(hsl2rgb(vec3(hue, 0.1 + length(flux), mag * 0.5)), 1.0);
    #endif



    // NOTE(Nic): render the angle of the slope vector
    // assuming its stored in the first 2 channels of the Q tex

    // vec2 Q = texture2D(u_Q, uv).rg;
    // vec2 Q_norm = normalize(Q);
    
    // float mag = length(Q.xy);
    // float angle = acos(Q_norm.x);

    // if (Q.y < 0.0) { angle = M_PI - (angle + M_PI); }
    // angle += M_PI * 1.5;
    // float hue = (angle / M_PI) / 2.0;

    // gl_FragColor = vec4(hsl2rgb(vec3(hue, mag, 0.5)), 1.0);
}