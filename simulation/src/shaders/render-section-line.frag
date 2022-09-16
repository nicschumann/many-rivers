precision highp float;

varying vec2 v_uv;

uniform vec2 u_p1;
uniform vec2 u_p2;
uniform vec3 u_color;
uniform vec2 u_resolution;

vec2 p1p2_to_mxb(vec2 p1, vec2 p2) {
    float m = (p2.y - p1.y) / (p2.x - p1.x);
    float b = -p1.x * m + p1.y;

    return vec2(m, b);
}

// thanks, iq
float line_segment(vec2 p, vec2 a, vec2 b) {
	vec2 ba = b - a;
	vec2 pa = p - a;
	float h = clamp(dot(pa, ba) / dot(ba, ba), 0., 1.);
	return length(pa - h * ba);
}

void main() {
    vec2 uv = v_uv;
    vec2 d = 1.0 / u_resolution;


    float line_dist = 0.002;
    float point_dist = 0.005;
    float threshold_dist = line_dist;

    float min_dist_to_pt = min(length(uv - u_p1), length(uv - u_p2));

    if (min_dist_to_pt < point_dist) {threshold_dist = point_dist;}
    
    float dist = line_segment(uv, u_p1, u_p2);

    if (dist < threshold_dist) {
        gl_FragColor = vec4(u_color, 1.0);
    } else {
        discard;
    }
}