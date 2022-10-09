precision highp float;

varying vec2 v_uv;
varying vec2 v_id;
varying vec3 v_norm;

uniform sampler2D u_H;


vec3 light_dir = normalize(vec3(1.0, 1.0, 0.0));
vec3 light_color = vec3(0.6, 0.3, 0.2);


void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    vec3 e = vec3(vec2(1.0/200.3), 0.0);

    float S = texture2D(u_H, v_uv).g;

    float Sx = texture2D(u_H, v_uv + e.xz).g;
    float Sy = texture2D(u_H, v_uv + e.zy).g;

    vec3 dx = vec3(e.x, Sx - S, 0.0);
    vec3 dy = vec3(0.0, Sy - S, e.y);
    // vec3 n = normalize((cross(dy, dx) + v_norm) / vec3(2.0));
    vec3 n = normalize(cross(dy, dx) * v_norm);

    vec3 ambient = vec3(0.6, 0.6, 0.2);
    float diffuse_coeff = dot(n, light_dir);
    vec3 color = ambient * diffuse_coeff * light_color;

    color = pow(color, vec3(0.72));

    gl_FragColor = vec4(
        n,
        1.
    );
}