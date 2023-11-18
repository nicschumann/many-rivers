precision highp float;

varying vec2 v_uv;

uniform sampler2D u_E;
uniform sampler2D u_K;
uniform sampler2D u_H;
uniform vec2 u_resolution;

void main() {
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.0);

    vec4 downsampled = texture2D(u_E, uv);
    vec4 K = texture2D(u_K, uv);

    if (downsampled.r > 0.0) { // it's a wet tile.

        float K_t = texture2D(u_K, uv - e.zy).r;
        float K_r = texture2D(u_K, uv + e.xz).r;
        float K_b = texture2D(u_K, uv + e.zy).r;
        float K_l = texture2D(u_K, uv - e.xz).r;

        float K_avg = 0.25 * (K_t + K_r + K_b + K_l);

        gl_FragColor = vec4(K_avg, K.gba);

    } else {

        gl_FragColor = K;

    }
}