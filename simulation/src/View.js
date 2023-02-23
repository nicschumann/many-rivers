import { TILE_SIZE } from './constants';

const render_tile_as_color = regl({
    vert: require('./shaders/place-tile.vert'),
    frag: require('./shaders/render-color.frag'),
    attributes: {
        a_position: regl.prop('a_position'),
        a_uv: regl.prop('a_uv')
    },
    uniforms: {
        u_transform: regl.prop('u_transform'),
        u_color: regl.prop('u_color'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4
});

class View {
    constructor(x, y, z, testcase=False) {
        this.is_testcase = testcase

        this.x = x;
        this.y = y;
        this.z = z;

        this.positions = [
            [this.x, this.y], [this.x + 1, this.y],
            [this.x, this.y + 1], [this.x + 1, this.y + 1]
        ]

        this.uvs = [
            [0, 0], [1, 0],
            [0, 1], [1, 1]
        ]

        this.parent = null
        this.loaded = false
        
        this.loading_color = [0/255, 74/255, 74/255];
    }

    

    update_positions () {
        this.positions = [
            [this.x, this.y], [this.x + 1, this.y],
            [this.x, this.y + 1], [this.x + 1, this.y + 1]
        ]
    }

    set_parent(parent) {
        this.parent = parent;
        // this.x = parent.x;
        // this.y = parent.y;
        // this.z = parent.z;
        // this.update_positions();
    }

    get_resources() {}

    simulate (resources, parameters) {}

    render (resources, parameters) {
        render_tile_as_color({
            a_position: this.positions,
            a_uv: this.uvs,
            u_transform: transform,
            u_color: this.loading_color
        });
    }
}

export { View };