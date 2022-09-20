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


    /**
     * Pattern 2: Flux based evolution
     */ 
    // NOTE: Q_acc_u_b <= Q_ero_l_b
    const float Q_accretion_upper_bound = 0.05; // less than this, accrete
    const float Q_erosion_lower_bound = 0.07; // more than this, erode
 
    float k_erosion = 0.01;
    float k_accretion = 0.001;
 
    // negative R_norm = accretional / exterior curve
    // positive R_norm = erosional / interior curve.
    if (W == 0.) { discard; }

    if (Q_rep <= u_Q_accretion_upper_bound) { // flux is above our minimum threshold.
        // do accretion

        float R_norm = K.r;

        if (R_norm < 0.) { // negative / interior curve
            // Therefore: strong accretion

            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

        } else if (R_norm > 0.) { // positive / exterior curve
            // Therefore: weak accetion??? or nothing?
            // For now, 0.

            gl_FragColor = vec4(0.5, 0.0, 0.0, 1.0);
        
        }
    
    } else if (Q_rep < u_Q_erosion_lower_bound) {
        // static case

        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);

    } else {
        // do erosion

        float sediment_slope = length(slope.ba);
        float R_norm = K.r;

        if (R_norm < 0.) { // negative / interior curve
            // Therefore: weak erosion?

            gl_FragColor = vec4(0.0, 0.5, 0.0, 1.0);

        } else if (R_norm > 0.) { // positive / exterior curve
            // Therefore: strong erosion!!
 
            gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
        
        }

    }
    


    
}