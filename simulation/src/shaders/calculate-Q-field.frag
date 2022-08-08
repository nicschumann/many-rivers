precision highp float;

varying vec2 v_uv;

uniform sampler2D u_B;
uniform sampler2D u_S;
uniform sampler2D u_W;

uniform float upper_bank = 0.4;
uniform float lower_bank = 0.6;
uniform float bank_width = 0.015;


void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    float y = v_uv.y;

    float SH =
        smoothstep(upper_bank - bank_width, upper_bank + bank_width, y) *
        (1.0 - smoothstep(lower_bank - bank_width, lower_bank + bank_width, y));

    SH = SH_max - SH * (SH_max - SH_min);

    gl_FragColor = vec4(SH, 0., 0., 1.0);
}