precision highp float;


varying vec2 v_uv;

uniform sampler2D u_H;
uniform sampler2D u_boundary;

uniform vec2 u_resolution;


void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    vec2 uv = v_uv;
    vec2 d = 1.0 / u_resolution;
    vec4 H = texture2D(u_H, uv);
 
    float WH = H.g; 
    float mask = texture2D(u_boundary, uv).a;
    
    if (mask > 0.0) { WH = 3.0; } 

    gl_FragColor = vec4(
        H.r, WH, H.b, H.a
    );
}