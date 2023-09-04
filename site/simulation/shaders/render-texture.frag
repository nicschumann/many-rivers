precision highp float;

varying vec2 v_uv;

uniform sampler2D u_data;
uniform float u_scalefactor;

void main() {
    vec2 uv = v_uv;
    float h = texture2D(u_data, uv).r;
    // gl_FragColor = vec4(vec3(height * u_scalefactor), 1.0);
    


    gl_FragColor = vec4(vec3(h) * u_scalefactor, 1.0);
}