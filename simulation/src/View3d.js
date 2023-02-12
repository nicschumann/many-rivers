import { vec3, mat4 } from "gl-matrix";

import { TILE_SIZE, RENDER_3D } from './constants';
import { DomainMesh } from './mesh';
import { View } from "./View.js";

let DOMAIN_MESH = new DomainMesh(window.regl, [512, 512]);

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
    render(transform, resources) {
        if (this.parent.loaded && RENDER_3D) {
            // 3D RENDERING STEPS
            // console.log('render');
            regl.clear({depth: 1.0});

            let camera = resources.camera;
            // console.log(camera);

            const target = camera.target;
            const camera_position = camera.position;

            const front = vec3.subtract([], target, camera_position);
            const right = vec3.cross([], front, [0.0, -1.0, 0.0]);
            const up = vec3.cross([], front, right);

            const V = mat4.lookAt([], camera_position, target, up);
            const P = mat4.perspective([], Math.PI / 4.0, window.innerWidth / window.innerHeight, 0.001, 100.0);

            const PV = mat4.multiply([], P, V);

            calculate_N_normals({
                target: this.parent.N.buffer,
                a_uv: this.parent.uvs,
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
                u_view_pos: camera_position
            });

            // render_point({
            //     u_basepoint: [this.x, 0.0, this.y]
            // })


        } else if (!this.parent.loaded)  {
            console.log('still loading!');
            // If we're still waiting for textures...
            render_tile_as_color({
                a_position: this.positions,
                a_uv: this.uvs,
                u_transform: transform,
                u_color: this.loading_color
            });

        }
    }
}

export { View3D };