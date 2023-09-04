precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;

uniform vec2 u_resolution;



void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    vec3 e = vec3(1.0 / (u_resolution / 2.0) , 0.0);

    vec4 H = texture2D(u_H, v_uv);

    vec4 Hx = texture2D(u_H, v_uv + e.xz);
    vec4 Hy = texture2D(u_H, v_uv + e.zy);

    float S = H.r + H.g + H.b;
    float Sx = Hx.r + Hx.g + Hx.b;
    float Sy = Hy.r + Hy.g + Hy.b;

    vec3 dx = vec3(e.x, Sx - S, 0.0);
    vec3 dy = vec3(0.0, Sy - S, e.y);

    vec3 n = normalize(cross(dy, dx));


    gl_FragColor = vec4(n, 1.);
}