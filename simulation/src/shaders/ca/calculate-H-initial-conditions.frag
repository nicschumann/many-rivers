precision highp float;

#define FILTER_SIZE 0.

varying vec2 v_uv;

uniform sampler2D u_elevation;
uniform sampler2D u_boundary;

uniform vec2 u_resolution;

float sediment_height(vec2 uv)
{
    vec3 rgb = texture2D(u_elevation, uv).rgb;
    float e = -10000.0 + ((rgb.r * 255.0 * 256.0 * 256.0 + rgb.g * 255.0 * 256.0 + rgb.b * 255.0) * 0.1);

    return e; // + 5.0 * (1.0 - uv.x); // forcing a slight slope...
}


void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    vec2 uv = v_uv;
    vec2 d = 1.0 / u_resolution;

    float SH = sediment_height(uv);
    float count = 1.0;

    // apply a blur filter to the elevations to smooth things out a bit.
    if (FILTER_SIZE > 0.) {
        for (float i = -FILTER_SIZE; i < FILTER_SIZE + 1.; i += 1.) {
            for (float j = -FILTER_SIZE; j < FILTER_SIZE + 1.; j += 1.) {
                if (i == 0. && j == 0.) { continue; }

                vec2 offset = d * vec2(i, j);
                vec2 neighbor_index = uv + offset;
                float r = length(vec2(i, j));
                float neighbor = sediment_height(neighbor_index);

                SH += neighbor;
                count += 1.0;
            }
        }
    }

    
    float WH = 0.0;
    float mask = texture2D(u_boundary, uv).a;
    
    // water height of 1 meter
    // WH = 1.0;
    if (mask > 0.0) { WH = 3.0; } 


    gl_FragColor = vec4(
        SH / count, WH, 0., 1.
    );
}