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


void main() {
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.);

    vec4 H = texture2D(u_H, uv);
    vec4 K = texture2D(u_K, uv);
    vec4 Q = texture2D(u_Q, uv);
    vec4 slope = texture2D(u_S, uv);
    vec2 flux = Q.ba;
    float Q_rep = length(flux);

    
    float W = H.b;
    float S = H.g;
    
    float E = 0.0;
    float A = 0.0;


    //
    // UPDATE SEDIMENT BASED ON CURVATURE
    //

    /**
     * Pattern 1: Flow-depth based evolution
     */
    // float k_er osion = 0.001;
    // float R_norm = K.r;
    // E = k_erosion * S * R_norm * Q_rep;


    // negative R_norm = accretional / exterior curve
    // positive R_norm = erosional / interior curve.

    if (Q_rep <= u_Q_accretion_upper_bound) { // flux is above our minimum threshold.
        // do accretion

        float sediment_slope = length(slope.ba);
        float R_norm = K.r;

        if (R_norm < 0.) { // negative / interior curve
            // Therefore: strong accretion

            E = 0.0;
            // note: removed slope, because low slope is more 
            // accretional than a high slope.
            A = u_k_accretion * abs(R_norm) * Q_rep;

        } else if (R_norm > 0.) { // positive / exterior curve
            // Therefore: weak accetion??? or nothing?
            // For now, 0.

            E = 0.0;
            A = 0.0;
        
        }
    
    } else if (Q_rep < u_Q_erosion_lower_bound) {
        // static case

        E = 0.0;
        A = 0.0;

    } else {
        // do erosion

        float sediment_slope = length(slope.ba);
        float R_norm = K.r;

        if (R_norm < 0.) { // negative / interior curve
            // Therefore: weak erosion?

            E = u_k_erosion * sediment_slope * abs(R_norm) * Q_rep; // k_erosion * sediment_slope * abs(R_norm) * Q_rep; // maybe scaled down?
            A = 0.0;

        } else if (R_norm > 0.) { // positive / exterior curve
            // Therefore: strong erosion!!
 
            E = u_k_erosion  * sediment_slope * abs(R_norm) * Q_rep; // maybe scaled down?
            A = 0.0;
        
        }

    }
    
    float delta_S = -E + A;
    S = S + delta_S;

    gl_FragColor = vec4(
        H.r,
        max(S, 0.),
        W,
        H.a
    );
}