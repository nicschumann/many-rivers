precision highp float;

#define FILTER_RANGE 5

varying vec2 v_uv;

uniform sampler2D u_E;
uniform sampler2D u_K;
uniform sampler2D u_H;
uniform vec2 u_resolution;

// uniform int FILTER_RANGE = 4;

// const float max_len = length(vec2(float(FILTER_RANGE), float(FILTER_RANGE)));

void main() {
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.0);

    vec4 K = texture2D(u_K, uv);
    float edge = K.a;
    float w = texture2D(u_H, uv).b;

    if (w > 0.0) { 
        // it's a wet cell, we need to propagate 
        // the cross-stream curvature gradient across
        // this cell.
        
        float a = 0.0;

        for (int i = -FILTER_RANGE; i < FILTER_RANGE + 1; i++) {
            for (int j = -FILTER_RANGE; j < FILTER_RANGE + 1; j++) {

                vec2 ioffset = vec2(float(i), float(j));
                float len = length(ioffset);
                vec2 offset = ioffset * e.xy;
                vec4 n_edge = texture2D(u_K, uv + offset);
                vec4 n_H = texture2D(u_H, uv + offset);

                // TODO(Nic): Calculate `sf` in terms of the actual size of 
                // the filter, not as a constant. Then the coefficients 
                // scale properly.
                const float sf = 0.125;
                float c = sf / (len + 1.);

                a += c * n_edge.r;
            }
        }

        gl_FragColor = vec4(a); 

    } else { // Just propagate the old value.
        gl_FragColor = K; 
    }  
}