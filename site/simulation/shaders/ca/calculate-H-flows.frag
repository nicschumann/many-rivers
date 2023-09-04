precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;
uniform sampler2D u_N;

uniform vec2 u_resolution;

void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    vec2 uv = v_uv;
    vec2 d = 1.0 / u_resolution;
    
    vec4 cell = texture2D(u_H, uv);
    vec2 flows = texture2D(u_N, uv).rg;

    float total_height = cell.r + cell.g;

    float dW = 0.0;

    for (float i = -1.; i < 2.; i += 1.) {
        for (float j = -1.; j < 2.; j += 1.) {
            if (i == 0. && j == 0.) { continue; }

            vec2 offset = d * vec2(i, j);

            vec2 neighbor_index = uv + offset;
            vec4 neighbor = texture2D(u_H, neighbor_index);
            vec2 neighbor_flows = texture2D(u_N, neighbor_index).rg;

            float neighbor_height = neighbor.r + neighbor.g;

            // the thresholds for the amount of water

            if (neighbor.g > 0.0 && neighbor_height > total_height) {
                // there's an inflow here
                
                dW += (neighbor.g * 0.001) / (neighbor_flows.g);

            } else if (cell.g > 0.0 && total_height > neighbor_height) {
                // there's an outflow here
                dW -= (cell.g * 0.001) / (flows.g);
            }

        }
    }


    gl_FragColor = vec4(cell.r, max(0., cell.g + dW), dW, 1.); 
}