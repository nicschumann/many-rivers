precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;
uniform vec2 u_resolution;

const float u_saturation_point = 0.0;
const float eps = 0.05;

void main() {
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.0);

    float c = texture2D(u_H, uv).b;

    // this cell is wet; skip it.
    if (c > u_saturation_point) { 
        gl_FragColor = vec4(0.); 
        return;
    }

    float t = texture2D(u_H, uv - e.zy).b;
    float l = texture2D(u_H, uv - e.xz).b;
    float b = texture2D(u_H, uv + e.zy).b;
    float r = texture2D(u_H, uv + e.xz).b;

    if (
        c <= u_saturation_point &&
        (t > u_saturation_point ||
         l > u_saturation_point ||
         b > u_saturation_point ||
         r > u_saturation_point)
    ) {
        gl_FragColor = vec4(1., 1., 1., 1.);
    } else {
        gl_FragColor = vec4(0.); 
    }
}