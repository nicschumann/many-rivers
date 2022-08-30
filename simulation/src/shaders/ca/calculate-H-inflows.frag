precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;
uniform sampler2D u_O; // outflow map.

uniform vec2 u_resolution;

// inflow step.
void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    vec2 uv = v_uv;
    vec3 d = vec3(1.0 / u_resolution, 0.);
    vec4 C = texture2D(u_H, uv);
    vec4 O = texture2D(u_O, uv);
    float out_C = O.r + O.g + O.b + O.a;

    float in_U = texture2D(u_O, uv - d.zy).b;
    float in_R = texture2D(u_O, uv + d.xz).a;
    float in_D = texture2D(u_O, uv + d.zy).r;
    float in_L = texture2D(u_O, uv - d.xz).g;

    gl_FragColor = vec4(
        C.r,
        C.g - out_C + in_U + in_R + in_D + in_L,
        C.b,
        C.a
    );
}