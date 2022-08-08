precision highp float;

#define M_PI 3.14159265359

varying vec2 v_uv;

uniform sampler2D u_Q;
uniform float u_scalefactor;

vec3 hsl2rgb( in vec3 c ){
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0,1.0);
    return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}

void main() {
    vec2 uv = v_uv;
    
    vec2 flux = texture2D(u_Q, uv).ba;
    
    // magnitude
    // gl_FragColor = vec4(length(flow_depth) * 10., 0., 0., 1.);


    // vec2 flow_depth_norm = normalize(flow_depth);
    
    // float mag = length(flow_depth);
    // float angle = acos(flow_depth_norm.x);

    // if (flow_depth.y < 0.0) { angle = M_PI - (angle + M_PI); }
    // angle += M_PI * 1.5;

    // float hue = (angle / M_PI) / 2.0;

    gl_FragColor = vec4(flux * 1., 0., 1.0);    




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