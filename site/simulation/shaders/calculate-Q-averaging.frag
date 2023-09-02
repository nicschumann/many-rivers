precision highp float;

#define FILTER_RANGE 1

varying vec2 v_uv;

uniform sampler2D u_Q;
uniform vec2 u_resolution;

void main() {

    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.0);
    vec4 F = texture2D(u_Q, uv);

    vec2 Q = vec2(0.);
    float count = 0.;

    if (length(F.ba) > 0.0) {
        // only average over non-zero flux cells.

        for (int i = -FILTER_RANGE; i < FILTER_RANGE + 1; i++) {
            for (int j = -FILTER_RANGE; j < FILTER_RANGE + 1; j++) {
                
                vec2 offset = vec2(float(i), float(j)) * e.xy;
                vec2 n_Q = texture2D(u_Q, uv + offset).ba;
                

                
                if (length(n_Q) > 0.0) { 
                    Q += n_Q;
                    count += 1.0; 
                }

                // if we don't want non-zero, then add a condition here.
            }
        }

        gl_FragColor = vec4(F.rg, vec2(Q / count));

    } else {

        gl_FragColor = F;

    }

    

    

    
       
}