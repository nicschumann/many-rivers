precision highp float;

// #define DRAW_BOUNDARY
#define M_PI 3.14159265359


varying vec2 v_uv;

uniform sampler2D u_H;
uniform vec2 u_resolution;


vec3 hsl2rgb( in vec3 c ){
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0,1.0);
    return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}

void main() {
    vec2 uv = v_uv;

    vec4 H = texture2D(u_H, uv);
    float s = H.r;
    float w = H.g;

    gl_FragColor = vec4(H.b * 100000., 0., 0., 1.);

    // vec2 u = H.ba;
    // vec2 u_norm = normalize(u);

    // float mag = length(u_norm);
    // float angle = acos(u_norm.x / mag);
    // float y = u_norm.y;

    // if (y < 0.0) { angle = M_PI - (angle + M_PI); }
    // angle += M_PI * 1.5;
    // float hue = (angle / M_PI) / 2.0;

    // gl_FragColor = vec4(hsl2rgb(vec3(hue, 1.0, 0.5)), 1.0);
}