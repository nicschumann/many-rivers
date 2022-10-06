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
    float flux_rep = length(flux);
    float curv_rep = K.r;

    
    float W = H.b;
    float S = H.g;
    vec3 color = vec3(0.);
    float alpha = 1.0;

    const float erode_min_curvature = 0.2;
    const float accrete_max_curvature = -0.2;
    


    if (W <= 0.0) {  discard; }// there better be water...

    if (flux_rep > u_Q_erosion_lower_bound) { // HIGH FLUX CASE

        if (curv_rep > erode_min_curvature) { // Outer Bank Positive Curvature 
            
            // RED
            color = vec3(0.7, 0., 0.);
            alpha = 1.0;

        } else if ( curv_rep > accrete_max_curvature ) { // straight bank, zero-ish

            // Purplish Magenta
            color = vec3(0.49, 0.07, 0.35);
            alpha = 1.0;

        } else { // Inner Bank Neg Curvature 

            // Deep Purple Blue
            color = vec3(0.27, 0.13, 0.69);
            alpha = 0.75;

        }

    } else if (flux_rep <= u_Q_erosion_lower_bound && flux_rep > u_Q_accretion_upper_bound) { // LOW FLUX CASE

        if (curv_rep > erode_min_curvature) { // Outer Bank Positive Curvature 
            
            // BRIGHT Purple
            color = vec3(0.78, 0.01, 0.78);
            alpha = 0.75;

        } else if ( curv_rep > accrete_max_curvature ) { // straight bank, zero-ish
            
            // LIGHT BLUE
            color = vec3(0.05, 0.53, 0.9);
            alpha = 0.75;

        } else { // Inner Bank Neg Curvature 

            // CYAN
            color = vec3(0., 0.72, 0.78);
            alpha = 1.0;
            
        }
    
    } else { // VLOW/NO FLUX CASE
        
        if (curv_rep > erode_min_curvature) { // Outer Bank Positive Curvature 
            
            // BEIGE
            color = vec3(0.92, 0.86, 0.47);
            alpha = 0.75;

        } else if ( curv_rep > accrete_max_curvature ) { // straight bank, zero-ish

            // Grass Green
            color = vec3(0.55, 0.88, 0.31);
            alpha = 1.0;

        } else { // Inner Bank Neg Curvature 

            // BRIGHT GREEN
            color = vec3(0.35, 0.83, 0.35);
            alpha = 1.0;
            
        }
    
    }

    alpha = 1.0;
    gl_FragColor = vec4(color, alpha);
}