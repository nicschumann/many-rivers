import { TILE_SIZE } from './constants';
import { View } from './View.js';

const render_crosssection = regl({
    vert: require('./shaders/place-tile.vert'),
    frag: require('./shaders/render-point-crosssection.frag'),
    attributes: {
        a_position: regl.prop('a_position'),
        a_uv: regl.prop('a_uv')
    },
    uniforms: {
        u_transform: regl.prop('u_transform'),
        u_p1: regl.prop('u_p1'),
        u_p2: regl.prop('u_p2'),
        u_H: regl.prop('u_H'),
        u_color: regl.prop('u_color'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4 
});


class CrossSection extends View {

    render(resources, parameters) {
        if (this.parent == null || !this.parent.loaded) { return; }

        let transform = resources.transform_2d;

        regl.clear({depth: 1.0});
        render_crosssection({
            u_p1: parameters.p1,
            u_p2: parameters.p2,
            u_H: this.parent.H.front,

            a_position: this.positions,
            a_uv: this.uvs,
            u_transform: transform,
            u_color: this.loading_color
        });
    }
}

export { CrossSection };