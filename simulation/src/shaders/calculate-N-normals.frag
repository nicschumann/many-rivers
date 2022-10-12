precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;

uniform vec2 u_resolution;



void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    vec3 e = vec3(1.0 / (u_resolution / 2.0) , 0.0);

    float S = texture2D(u_H, v_uv).g;

    float Sx = texture2D(u_H, v_uv + e.xz).g;
    float Sy = texture2D(u_H, v_uv + e.zy).g;

    vec3 dx = vec3(e.x, Sx - S, 0.0);
    vec3 dy = vec3(0.0, Sy - S, e.y);

    vec3 n = normalize(cross(dy, dx));


    gl_FragColor = vec4(n, 1.);
}