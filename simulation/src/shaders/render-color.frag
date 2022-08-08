precision highp float;

uniform vec3 u_color;

void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    gl_FragColor = vec4(u_color, 1.0);
}