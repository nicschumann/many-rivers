import { TILE_SIZE } from './constants';
import { DomainMesh } from './mesh';
import { View } from './view'


class View3D extends View {
    render(resources, parameters) {
        if (this.parent.loaded) {
            // 3D RENDERING STEPS
            // console.log('render');
            this.regl.clear({depth: 1.0});

            let PV = resources.camera.get_matrix();

            this.shaders.calculate_N_normals({
                target: this.parent.N.buffer,
                a_uv: this.uvs,
                u_H: this.parent.H.front,
            });

            this.shaders.render_domain({
                u_basepoint: [this.x, 0.0, this.y],
                u_transform: PV,

                u_H: this.parent.H.front,
                u_N: this.parent.N.buffer
            });

            this.shaders.render_river({
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
            // If we're still waiting for textures...
            // super.render(resources, parameters);

        }
    }
}

export { View3D };