precision highp float;

#define FILTER_RANGE 0

attribute vec3 a_position;
attribute vec2 a_uv;
attribute vec2 a_id;

varying vec2 v_uv;
varying vec2 v_id;
varying vec3 v_pos;

uniform mat4 u_transform;
uniform vec3 u_basepoint;
uniform vec2 u_resolution;

uniform sampler2D u_H;

const float scale = 0.001;


float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

void main() {
    vec3 e = vec3(1.0 / u_resolution, 0.);

    float S = texture2D(u_H, a_uv).g;

    if (FILTER_RANGE > 0) {
        float neighbors = 0.0;
        float neighbor_count = 0.0;

        for (int i = -FILTER_RANGE; i < FILTER_RANGE + 1; i++) {
            for (int j = -FILTER_RANGE; j < FILTER_RANGE + 1; j++) {
                if (i == 0 && j == 0) { continue; }

                vec2 ioffset = vec2(float(i), float(j));
                vec2 offset = ioffset * e.xy;
                vec4 n_H = texture2D(u_H, a_uv + offset);

                neighbors += n_H.g;
                neighbor_count += 1.0;
            }
        }

        S = 0.5 * S + 0.5 / neighbor_count * neighbors;
    }
    
    vec3 displaced = u_basepoint + vec3(0., S * scale, 0.);
    vec3 position = a_position + displaced;

    v_uv = a_uv;
    v_id = a_id;
    v_pos = position; // + noise(position) * 1.0;    

    vec4 view_position = u_transform * vec4(position, 1.0);
    gl_Position = view_position;

    // gl_Position = vec4(shifted_pos.xy, 0., 1.);
}