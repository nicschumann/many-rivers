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
    vec2 flux = Q.ba;
    float flux_rep = length(flux);

    
    float W = H.b;
    float S = H.g;
    float E = 0.;


    //
    // UPDATE SEDIMENT BASED ON CURVATURE
    //

    /**
     * Pattern 1: Flow-depth based evolution
     */
    // float k_erosion = 0.001;
    // float R_norm = K.r;
    // E = k_erosion * S * R_norm * flux_rep;


    /**
     * Pattern 2: Flux based evolution
     */ 

    if (flux_rep > u_Q_erosion_lower_bound) {

        float slope_rep = length(slope.ba);
        float R_norm = K.r;

        E = u_k_erosion * slope_rep * R_norm * flux_rep;
    }
    
    S = S - E;

    gl_FragColor = vec4(
        H.r,
        max(S, 0.),
        W,
        H.a
    );
}