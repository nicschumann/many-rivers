precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;
uniform sampler2D u_E;
uniform vec2 u_resolution;

const float u_saturation_point = 0.0;

void main() {
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.0);

    vec4 edge = texture2D(u_E, uv);

    if (edge.x == 1.0) {

        float neighbors = 0.0;

        for (int i = -1; i < 1 + 1; i++) {
            for (int j = -1; j < 1 + 1; j++) {
                if (i == 0 && j == 0) { continue; }

                vec2 ioffset = vec2(float(i), float(j));
                vec2 offset = ioffset * e.xy;
                vec4 n_edge = texture2D(u_E, uv + offset);

                if (n_edge.x > 0.0) {
                    neighbors += 1.0;                    
                }
            }
        }

        if (neighbors == 2.0) {
            gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
        } else {
            gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
        }

    } else {
        gl_FragColor = edge;
    }

    
}