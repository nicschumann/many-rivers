precision highp float;

#define FILTER_RANGE 2

varying vec2 v_uv;

uniform sampler2D u_H;
uniform sampler2D u_E;
uniform vec2 u_resolution;


void main() {
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.0);

    float cell = texture2D(u_E, uv).a;

    if (cell > 0.) { // it's an edge cell

        float wet = 0.;
        float dry = 0.;

        for (int i = -FILTER_RANGE; i < FILTER_RANGE + 1; i++) {
            for (int j = -FILTER_RANGE; j < FILTER_RANGE + 1; j++) {

                vec2 offset = vec2(float(i), float(j)) * e.xy;
                float n_edge = texture2D(u_E, uv + offset).a;
                float n_wetness = texture2D(u_H, uv + offset).b;

                if ( n_wetness > 0. && n_edge == 0.0 ) { wet += 1.0; }
                else if ( n_edge == 0.0 ) { dry += 1.0; }

            }
        }

        gl_FragColor = vec4(vec3(dry - wet), 1.0);
        
    } else {
        gl_FragColor = vec4(0.); 
    }


    
}