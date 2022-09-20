precision highp float;

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
    float E = 0.;
    float A = 0.;

    if (curv_rep < 0.) {
        // accretion area
        if (flux_rep > 0. && flux_rep <= u_Q_accretion_upper_bound) {
            A = u_k_accretion * abs(curv_rep); // take out flux rep, because it should be small here.
        }

    } else if (curv_rep > 0.) {
        // erosion area
        if (flux_rep >= u_Q_erosion_lower_bound) {
            E = u_k_erosion * abs(curv_rep);
        }
    }

    
    float dS = -E + A;
    
    S = S + dS;

    gl_FragColor = vec4(
        H.r,
        max(S, 0.),
        W,
        dS
    );
}