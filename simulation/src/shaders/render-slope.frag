precision highp float;

#define M_PI 3.14159265359
#define NORMALIZE_FLUX
// #define RENDER_FLUX_MAGNITUDE

varying vec2 v_uv;

uniform sampler2D u_S;
uniform sampler2D u_H;
uniform float u_scalefactor;

vec3 hsl2rgb( in vec3 c ){
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0,1.0);
    return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}

void main() {
    vec2 uv = v_uv;
    
    vec2 slope = texture2D(u_S, uv).rg;
    vec2 slope_norm = normalize(slope);
    
    float mag = length(slope);
    float angle = acos(slope_norm.x / mag);
    float y = slope_norm.y;

    if (y < 0.0) { angle = M_PI - (angle + M_PI); }
    angle += M_PI * 1.5;
    float hue = (angle / M_PI) / 2.0;

    // gl_FragColor = vec4(hsl2rgb(vec3(hue, clamp(mag, 0., 1.), mag * 0.5)), 1.0);
    gl_FragColor = vec4(hsl2rgb(vec3(hue, 1.0, 0.5)), 1.0);
}