precision highp float;

#define FILTER_RANGE 0

attribute vec3 a_position;
attribute vec2 a_uv;
attribute vec2 a_id;

varying vec2 v_uv;
varying vec2 v_id;
varying vec3 v_pos;
varying float v_W;
varying float v_S;

uniform mat4 u_transform;
uniform vec3 u_basepoint;
uniform vec2 u_resolution;

uniform sampler2D u_H;

const float scale = 0.001;

void main() {
    vec3 e = vec3(1.0 / u_resolution, 0.);

    vec2 SW = texture2D(u_H, a_uv).gb;
    float S = SW.x;
    float W = SW.y;

    if (FILTER_RANGE > 0) {
        float neighbors_S = 0.0;
        float neighbors_W = 0.0;
        float neighbor_count = 0.0;

        for (int i = -FILTER_RANGE; i < FILTER_RANGE + 1; i++) {
            for (int j = -FILTER_RANGE; j < FILTER_RANGE + 1; j++) {
                if (i == 0 && j == 0) { continue; }

                vec2 ioffset = vec2(float(i), float(j));
                vec2 offset = ioffset * e.xy;
                vec4 n_H = texture2D(u_H, a_uv + offset);

                neighbors_S += n_H.g;
                neighbors_W += n_H.b;
                neighbor_count += 1.0;
            }
        }

        S = 0.5 * S + 0.5 / neighbor_count * neighbors_S;
        W = 0.5 * W + 0.5 / neighbor_count * neighbors_W;
    }
    
    vec3 displaced = u_basepoint + vec3(0., (S + W) * scale, 0.);
    vec3 position = a_position + displaced;

    v_uv = a_uv;
    v_id = a_id;
    v_pos = position;   
    v_W = W; 
    v_S = S;

    vec4 view_position = u_transform * vec4(position, 1.0);

    if (W == 0.) { view_position / W; } // discard vertex if there's no water...

    gl_Position = view_position;

    // gl_Position = vec4(shifted_pos.xy, 0., 1.);
}