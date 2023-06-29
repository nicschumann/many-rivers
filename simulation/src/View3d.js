import { TILE_SIZE } from './constants';
import { DomainMesh } from './mesh';
import { View } from "./View.js";

let DOMAIN_MESH = new DomainMesh(window.regl, [512,512]);

// DRAW CALLS

// surface normal calculation
const calculate_N_normals = window.regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/calculate-N-normals.frag'),
    attributes: {
        a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        a_uv: regl.prop('a_uv')
    },
    uniforms: {
        u_H: regl.prop('u_H'),
        u_resolution: TILE_SIZE,
    },
    primitive: "triangle strip",
    count: 4
});


const render_domain = window.regl({
    framebuffer: null,
    vert: require('./shaders/place-mesh.vert'),
    frag: require('./shaders/render-domain.frag'),
    attributes: {
        a_position: DOMAIN_MESH.vertices,
        a_uv: DOMAIN_MESH.uvs,
        a_id: DOMAIN_MESH.ids
    },
    elements: DOMAIN_MESH.indices,
    uniforms: {
        u_transform: regl.prop('u_transform'),
        u_basepoint: regl.prop('u_basepoint'),
        u_resolution: DOMAIN_MESH.cells,

        u_H: regl.prop('u_H'),
        u_N: regl.prop('u_N')
    },
    primitive: 'triangles',
    offset: 0,
    count: DOMAIN_MESH.indices.length * 3.0
});


const render_river = window.regl({
    framebuffer: null,
    vert: require('./shaders/place-river.vert'),
    frag: require('./shaders/render-river.frag'),
    attributes: {
        a_position: DOMAIN_MESH.vertices,
        a_uv: DOMAIN_MESH.uvs,
        a_id: DOMAIN_MESH.ids
    },
    elements: DOMAIN_MESH.indices,
    uniforms: {
        u_transform: regl.prop('u_transform'),
        u_basepoint: regl.prop('u_basepoint'),
        u_resolution: DOMAIN_MESH.cells,
        u_tex_resolution: TILE_SIZE,

        u_H: regl.prop('u_H'),
        u_N: regl.prop('u_N'),
        u_view_pos: regl.prop('u_view_pos')
    },
    primitive: 'triangles',
    offset: 0,
    depth: { func: 'lequal' },
    blend: {
        enable: true,
        func: {src: 'src alpha', dst: 'one minus src alpha'}
    },
    count: DOMAIN_MESH.indices.length * 3.0
});

class View3D extends View {
    render(resources, parameters) {
        if (this.parent.loaded) {
            // 3D RENDERING STEPS
            // console.log('render');
            regl.clear({depth: 1.0});

            let PV = resources.camera.get_matrix();

            calculate_N_normals({
                target: this.parent.N.buffer,
                a_uv: this.uvs,
                u_H: this.parent.H.front,
            });

            render_domain({
                u_basepoint: [this.x, 0.0, this.y],
                u_transform: PV,

                u_H: this.parent.H.front,
                u_N: this.parent.N.buffer
            });

            render_river({
                u_basepoint: [this.x, 0.0, this.y],
                u_transform: PV,

                u_H: this.parent.H.front,
                u_N: this.parent.N.buffer,
                u_view_pos: resources.camera.position
            });

            // render_point({
            //     u_basepoint: [this.x, 0.0, this.y]
            // })


        } else if (!this.parent.loaded)  {
            console.log('still loading!');
            // If we're still waiting for textures...
            super.render(resources, parameters);

        }
    }
}

export { View3D };