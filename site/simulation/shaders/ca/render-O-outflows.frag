precision highp float;

// #define DRAW_BOUNDARY


varying vec2 v_uv;

uniform sampler2D u_O;
uniform vec2 u_resolution;


void main() {
    vec2 uv = v_uv;

    vec4 O = texture2D(u_O, uv);
    if (length(O) == 0.) { discard; }

    gl_FragColor = vec4(
        O.g,
        0., // O.g,
        0., //
        1.
    ); 
}