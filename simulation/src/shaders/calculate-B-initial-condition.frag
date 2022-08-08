precision highp float;

varying vec2 v_uv;

void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    gl_FragColor = vec4(1.0 - v_uv.x, 0., 0., 1.0);
}