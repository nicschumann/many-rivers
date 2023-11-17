precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;
uniform sampler2D u_E;
uniform vec2 u_resolution;
uniform vec2 u_sim_resolution;

void main() {
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.0);

    vec4 downsampling = texture2D(u_E, uv);
    float c = downsampling.r;

    // this cell is wet; skip it.
    if (c == 1.0) { 
        gl_FragColor = vec4(downsampling.rgb, 0.); 
        return;
    }

    float t = texture2D(u_E, uv - e.zy).r;
    float l = texture2D(u_E, uv - e.xz).r;
    float b = texture2D(u_E, uv + e.zy).r;
    float r = texture2D(u_E, uv + e.xz).r;

    if (
        (t == 1.0 ||
         l == 1.0 ||
         b == 1.0 ||
         r == 1.0)
    ) {
        
        gl_FragColor = vec4(downsampling.rgb, 1.);
    } else {
        gl_FragColor = vec4(downsampling.rgb, 0.); 
    }
}