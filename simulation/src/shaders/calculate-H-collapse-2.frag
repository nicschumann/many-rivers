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
uniform float u_min_failure_slope;

uniform vec2 u_resolution;

const float total_neighbors = pow(2.0 * float(FILTER_RANGE) + 1.0, 2.0);
 
void main() {
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.);

    vec4 H = texture2D(u_H, uv);
    vec4 K = texture2D(u_K, uv);
    vec4 Q = texture2D(u_Q, uv);

    float flux_rep = length(Q.ba);
    float curv_rep = K.r;

    float W = H.b;
    float S = H.g;
    float dS = H.a;
    float c_H = H.r + S;
    

    // total slope calculation
    // vec2 slope_rb = texture2D(u_S, uv).ba;
    // vec2 slope_lt = vec2(
    //     texture2D(u_S, uv - e.xz).b,
    //     texture2D(u_S, uv - e.zy).a
    // );

    // float total_slope = slope_rb.x + slope_rb.y - slope_lt.x - slope_lt.y;

    float E = 0.;
    float A = 0.;

    const float collapse_height = 0.5;
    const float u_k_collapse = 0.2;

    for (int i = -FILTER_RANGE; i < FILTER_RANGE + 1; i++) {
        for (int j = -FILTER_RANGE; j < FILTER_RANGE + 1; j++) {    
            // positive contribution:
            // am I much lower than my neighbor? I should receive some of it's material
            // am I much higher than my neighbor? I should give some of my material
            vec2 offset = vec2(float(i), float(j)) * e.xy;
            float n_flux_rep = length(texture2D(u_Q, uv + offset).ba);

            vec2 n_BS = texture2D(u_H, uv + offset).rg;
            float n_H = n_BS.x + n_BS.y;



            if (
                n_H - c_H > collapse_height && 
                flux_rep > u_Q_erosion_lower_bound
            ) {
                A += (n_H - c_H) * u_k_collapse;
            }
            
            if (
                c_H - n_H > collapse_height && 
                n_flux_rep > u_Q_erosion_lower_bound
            ) {
                E += (c_H - n_H) * u_k_collapse;
            }
            
        }
    }

    S = S + (A - E);
    W = W - (A - E);

    if (A - E > 0.0) {

        dS = 1.0;

    } else if (A - E < 0.0) {
    
        dS = -1.0;
    
    } else {
     
        dS = 0.0;

    }
    

    gl_FragColor = vec4(
        H.r,
        max(S, 0.0),
        W,
        dS
    );
}