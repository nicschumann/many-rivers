precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;
uniform vec2 u_resolution;

void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    vec2 uv = v_uv;
    vec2 d = 1.0 / u_resolution;
    vec4 cell = texture2D(u_H, uv);
    float total_height = cell.r + cell.g;

    float inflows = 0.;
    float outflows = 0.;

    for (float i = -1.; i < 2.; i += 1.) {
        for (float j = -1.; j < 2.; j += 1.) {
            if (i == 0. && j == 0.) { continue; }

            vec2 offset = d * vec2(i, j);
            vec2 neighbor_index = uv + offset;
            vec4 neighbor = texture2D(u_H, neighbor_index);
            float neighbor_height = neighbor.r + neighbor.g;

            inflows += max(sign(neighbor_height - total_height), 0.);
            outflows += max(sign(total_height - neighbor_height), 0.);
        }
    }

    gl_FragColor = vec4(
        inflows, outflows, 0., 1.
    );
}