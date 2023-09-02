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
    float vel_rep = length(Q.ba / Q.rg);
    float curv_rep = K.r;

    
    float W = H.b;
    float S = H.g;

    float E = 0.;
    float A = 0.;

    const float erode_min_curvature = 0.2;
    const float accrete_max_curvature = -0.2;


    // TODO(Nic): rename u_Q_accretion_upper_bound -> lower

    if (H.b > 0.0) { // there better be water...

        if (flux_rep > u_Q_erosion_lower_bound) { // HIGH FLUX CASE

            if (curv_rep > erode_min_curvature) { // Outer Bank Positive Curvature 
                
                // E = u_k_erosion * abs(curv_rep);
                E = u_k_erosion * vel_rep;

            } else if ( curv_rep > accrete_max_curvature ) { // straight bank, zero-ish

                // E = u_k_erosion * abs(curv_rep);
                E = u_k_erosion * vel_rep;

            } else { // Inner Bank Neg Curvature 

                E = 0.0;

            }

        } else if (flux_rep <= u_Q_erosion_lower_bound && flux_rep > u_Q_accretion_upper_bound) { // LOW FLUX CASE

            if (curv_rep > erode_min_curvature) { // Outer Bank Positive Curvature 
                
                A = 0.0;
                // E = u_k_erosion * abs(curv_rep) * 0.1;
                E = u_k_erosion * vel_rep;

            } else if ( curv_rep > accrete_max_curvature ) { // straight bank, zero-ish

                A = 0.0;

            } else { // Inner Bank Neg Curvature 

                // A = u_k_accretion * abs(curv_rep); // adding in flux rep to control accretion.
                A = u_k_accretion * vel_rep; // adding in flux rep to control accretion.
                
            }
        
        } else { // VLOW/NO FLUX CASE
            
            if (curv_rep > erode_min_curvature) { // Outer Bank Positive Curvature 
                
                A = 0.0;

            } else if ( curv_rep > accrete_max_curvature ) { // straight bank, zero-ish

                // A = u_k_accretion * abs(curv_rep) * 1.0; // accretion speed factor...
                A = u_k_accretion * vel_rep; // accretion speed factor...

            } else { // Inner Bank Neg Curvature 

                // A = u_k_accretion * abs(curv_rep) * 1.0; // accretion speed factor...
                A = u_k_accretion * vel_rep; // accretion speed factor...
                
            }
        
        }

    }
    
    
    // if (curv_rep < 0.) {
    //     // accretion area
        
    //     // low flux, negative curvature (inside bank)
    //     if (flux_rep > 0. && flux_rep <= u_Q_accretion_upper_bound) {
    //         A = u_k_accretion * abs(curv_rep); // take out flux rep, because it should be small here.
    //     }

    //     // high flux, negative curvature (inside bank)

    // } else if (curv_rep > 0.) {
    //     // erosion area

    //     // low flux, positive curvature (outer bank)

    //     // high flux, positive curvature (outer bank)
    //     if (flux_rep >= u_Q_erosion_lower_bound) {
    //         E = u_k_erosion * abs(curv_rep);
    //     }  
    // }

    
    float dS = -E + A;
    
    S = S + dS;
    
    // NOTE(Lukas): This is a hack that slows accretion significantly
    // if you turn it on, consider turning down accretion knob, and 
    // increasing erosion knob.
    // W = W - A;

    gl_FragColor = vec4(
        H.r,
        max(S, 0.),
        max(W, 0.),
        dS
    );
}