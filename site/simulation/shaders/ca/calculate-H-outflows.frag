precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;

uniform vec2 u_resolution;

// outflow step.
void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    vec2 uv = v_uv;
    vec3 d = vec3(1.0 / u_resolution, 0.);
    vec4 C = texture2D(u_H, uv);

    // cells that aren't wet don't have any outflow.
    if (C.g <= 0.) { gl_FragColor = vec4(0.); return; } 


    float C_h = C.r + C.g;


    // up
    vec4 U = texture2D(u_H, uv - d.zy);
    float U_h = U.r + U.g;
    float U_s = (U_h - C_h) / 5.0; // rise over run = sqrt(5^2 + 5^2)
    float U_o = 0.;
    
    // right
    vec4 R = texture2D(u_H, uv + d.xz);
    float R_h = R.r + R.g;
    float R_s = (R_h - C_h) / 5.0; // rise over run = sqrt(5^2 + 0^2)
    float R_o = 0.;
    
    // down
    vec4 D = texture2D(u_H, uv + d.zy);
    float D_h = D.r + D.g;
    float D_s = (D_h - C_h) / 5.0; // rise over run = sqrt(5^2 + 5^2)
    float D_o = 0.;

    // left
    vec4 L = texture2D(u_H, uv - d.xz);
    float L_h = L.r + L.g;
    float L_s = (L_h - C_h) / 5.0; // rise over run = sqrt(5^2 + 5^2)
    float L_o = 0.;

    // sum up all the stuff that's negative, because those are slopes where
    // our cell is higher than the neighbor.
    float T = min(U_s, 0.) + min(R_s, 0.) + min(D_s, 0.) + min(L_s, 0.);

    if (U_s < 0.) {
        // it's an outflow into the cell above
        U_o = C.g * (U_s / T); // neg / neg = pos
    }

    if (R_s < 0.) {
        // it's an outflow into the cell to the right
        R_o = C.g * (R_s / T); // neg / neg = pos
    }

    if (D_s < 0.) {
        // it's an outflow into the cell below
        D_o = C.g * (D_s / T); // neg / neg = pos
    }

    if (L_s < 0.) {
        // it's an outflow into the cell to the left
        L_o = C.g * (L_s / T); // neg / neg = pos
    }

    gl_FragColor = vec4(
        U_o, 
        R_o, 
        D_o, 
        L_o
    );
}