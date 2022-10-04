precision highp float;

#define FILTER_RANGE 1

varying vec2 v_uv;

uniform sampler2D u_H;
uniform sampler2D u_K;
uniform sampler2D u_Q;
uniform sampler2D u_S;

uniform float u_k_erosion;
uniform float u_k_accretion;
uniform float u_Q_accretion_upper_bound;
uniform float u_Q_erosion_lower_bound;

uniform vec2 u_resolution;

const float total_neighbors = pow(2.0 * float(FILTER_RANGE) + 1.0, 2.0);

void main() {
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.);

    vec4 H = texture2D(u_H, uv);
    vec4 K = texture2D(u_K, uv);
    vec4 Q = texture2D(u_Q, uv);
    vec4 slope = texture2D(u_S, uv);

    float flux_rep = length(Q.ba);
    float curv_rep = K.r;
    
    float W = H.b;
    float S = H.g;
    float dS = H.a;

    float E = 0.;
    float S_avg = 0.;
    float Q_avg = 0.;

    // get the average height of the neighborhood.
    for (int i = -FILTER_RANGE; i < FILTER_RANGE + 1; i++) {
        for (int j = -FILTER_RANGE; j < FILTER_RANGE + 1; j++) {            
            vec2 offset = vec2(float(i), float(j)) * e.xy;
            float n_S = texture2D(u_H, uv + offset).g;
            vec2 n_Q = texture2D(u_Q, uv + offset).ba;

            S_avg += n_S;
            Q_avg += length(n_Q);
        }
    }

    S_avg /= total_neighbors;

    // ??
    const float collapse_distance = 0.2;
    const float collapse_multiplier = 5.0; // collapse should happen 5x faster than normal erosion

    if (Q_avg > u_Q_erosion_lower_bound && curv_rep > 0.0) {
        if (S - S_avg > collapse_distance) {
            E = u_k_erosion * collapse_multiplier * (S - S_avg);
        }
    }

    S = S - E;
    W = W + E;

    gl_FragColor = vec4(
        H.r,
        max(S, 0.),
        W,
        E
    );
}