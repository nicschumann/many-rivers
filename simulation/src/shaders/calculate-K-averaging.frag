precision highp float;

#define FILTER_RANGE 3

varying vec2 v_uv;

uniform sampler2D u_E;
uniform sampler2D u_K;
uniform vec2 u_resolution;


void main() {
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.0);

    float cell = texture2D(u_K, uv).a;

    if (cell > 0.) { // it's an edge cell

        float k = 0.;
        float count = 0.;

        for (int i = -FILTER_RANGE; i < FILTER_RANGE + 1; i++) {
            for (int j = -FILTER_RANGE; j < FILTER_RANGE + 1; j++) {

                vec2 offset = vec2(float(i), float(j)) * e.xy;
                vec4 n_edge = texture2D(u_K, uv + offset);
                
                // we have an edge.
                if ( n_edge.a > 0. ) {
                    k += n_edge.r;
                    count += 1.;
                 }
            }
        }

        gl_FragColor = vec4(vec3(k / count), 1.0);
        
    } else {
        gl_FragColor = vec4(0.); 
    }  
}