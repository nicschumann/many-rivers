precision highp float;

varying vec2 v_uv;
varying vec2 v_id;

void main() {
    // Sample the terrain-rgb tile at the current fragment location.

    gl_FragColor = vec4(
        v_uv,
        0.,
        1.
    );
}