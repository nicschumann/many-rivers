precision highp float;

#define FILTER_RANGE 5

varying vec2 v_uv;

uniform sampler2D u_E;
uniform sampler2D u_K;
uniform sampler2D u_H;
uniform vec2 u_resolution;


void main() {
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.0);

    float edge = texture2D(u_K, uv).a;
    float w = texture2D(u_H, uv).b;


    if (edge > 0.) { // it's an edge cell

        float k = 0.;
        float count = 0.;

        for (int i = -FILTER_RANGE; i < FILTER_RANGE + 1; i++) {
            for (int j = -FILTER_RANGE; j < FILTER_RANGE + 1; j++) {

                vec2 offset = vec2(float(i), float(j)) * e.xy;
                vec4 n_edge = texture2D(u_K, uv + offset);
                
                // we only care about neighbor edges for this first 
                // smoothing pass, so ignore it if it's not a not edge.
                if ( n_edge.a > 0. ) {
                    k += n_edge.r;
                    count += 1.;
                }
            }
        }
        
        const float bias = 0.002;
        // controls the bias towards erosion overall.
        const float k_max_mag = 3.0;
        float v = min(max(k / count, -k_max_mag), k_max_mag); // clamp the max curvature for the boundaries
        gl_FragColor = vec4(vec3(v + bias), 1.0);

    } else {
        gl_FragColor = vec4(0.); 
    }  
}