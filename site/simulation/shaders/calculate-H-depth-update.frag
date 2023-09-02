precision highp float;

varying vec2 v_uv;

uniform sampler2D u_H;
uniform sampler2D u_Q;
uniform sampler2D u_K;

uniform vec2 u_resolution;


float H(vec2 xy) {
    vec3 h = texture2D(u_H, xy).rgb;
    return h.r + h.g + h.b;
}

float BS(vec2 xy) {
    vec3 h = texture2D(u_H, xy).rgb;
    return h.r + h.g;
}

float W(vec2 xy) {
    vec3 h = texture2D(u_H, xy).rgb;
    return h.b;
}

float S(vec2 xy) {
    vec3 h = texture2D(u_H, xy).rgb;
    return h.g;
}

vec2 flow_depth(vec2 xy) {
    vec2 fd = texture2D(u_Q, xy).rg;
    return fd;
}

vec2 flux(vec2 xy) {
    vec2 fl = texture2D(u_Q, xy).ba;
    return fl;
}

void main() {
    vec2 uv = v_uv;
    vec3 e = vec3(1.0 / u_resolution, 0.);
    vec4 H = texture2D(u_H, uv);
    
    vec2 d = vec2(4.0, 4.0);
    float dt = 0.1; // max 0.1

    vec2 flux_lt = vec2(
        flux(uv - e.xz).x,
        flux(uv - e.zy).y
    );
    vec2 flux_rb = flux(uv);

    vec2 lt = flux_lt;
    vec2 rb = flux_rb;
 
    float total_flux = lt.x + lt.y + -rb.x + -rb.y;
    float W_new = W(uv) + (dt / (d.x * d.y)) * total_flux;

    /**
    * NOTE(Nic): I've removed depth clamping. Setting different 
    * min-water values cause the river to behave very differently.
    * At high min-water values, the river essentially cannot spill 
    * into new areas, because the flux is never high enough to generate 
    * enough water to make a new cell go from 0 to above the threshold 
    * in a single timestep.
    *
    * at low values, you can observe significant bank overflow. 
    *
    * In some ways, this parameter behaves like a viscousity for the 
    * entire water systems. The higher the value, the more viscous
    * the system appreas to be.
    */

    // depth clamping.
    const float min_water_depth = 0.00001; // no min-water
    
    /* NOTE(Nic): You can also add a total_flux constraint here: 
     * only set the water to 0 if it's below the min-depth AND 
     * the total flux on the cell is negative, meaning there's net 
     * water loss occuring.
     */
    if (W_new < min_water_depth) { W_new = 0.0; }

    gl_FragColor = vec4(
        H.r,
        H.g,
        W_new,
        H.a
    );
}