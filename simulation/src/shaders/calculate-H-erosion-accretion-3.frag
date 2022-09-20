precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;
uniform sampler2D u_K;
uniform sampler2D u_Q;
uniform sampler2D u_S;

uniform vec2 u_resolution;

uniform float u_k_erosion;
uniform float u_k_accretion;
uniform float u_Q_accretion_upper_bound;
uniform float u_Q_erosion_lower_bound;


vec2 flux_factors(float q)
{
    const float center = 0.1;
    const float alpha = 30.0;
    
    float e = exp(-alpha * (q - center));

    float A_term = max(4.1 * e * (1.0 - e) - 0.025, 0.0);
    float E_term = max(1.0 / (1.0 - e), 0.0);

    return vec2(A_term, E_term);
}

void main() {
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.);

    vec4 H = texture2D(u_H, uv);
    vec4 K = texture2D(u_K, uv);
    vec4 Q = texture2D(u_Q, uv);
    vec4 slope = texture2D(u_S, uv);
    
    float Q_rep = length(Q.ba); // flux
    float slope_rep = length(slope.ba); // sediment slope
    float K_rep = K.r;

    
    float W = H.b;
    float S = H.g;

    vec2 q_terms = flux_factors(Q_rep);

    // only accrete when in the accretional regime, and curvature is negative.
    float A = u_k_accretion * q_terms.x * abs(min(K_rep, 0.0));

    // only erode when in the erosional regime, curvature is positive, and slope is higher.
    float E = u_k_erosion * q_terms.y * max(K_rep, 0.0) * slope_rep;
   
    
    float delta_S = -E + A;
    S = S + delta_S;

    gl_FragColor = vec4(
        H.r,
        max(S, 0.),
        W,
        delta_S
    );
}