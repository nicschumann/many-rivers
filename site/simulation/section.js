import { View } from './view';


class CrossSection extends View {

    render(resources, simdata, uidata) {
        if (this.parent == null || !this.parent.loaded) { return; }

        let transform = resources.transform_2d;

        // let p1 = resources.camera.position;
        // let p2 = vec3.scale([], resources.camera.target, 0.25);
        // p1 = [p1[0], p1[2]];
        // p2 = [p2[0], p2[2]]
        // parameters.p1 = p1;
        // parameters.p2 = p2;

        this.regl.clear({depth: 1.0});
        this.shaders.render_crosssection({
            u_p1: uidata.p1,
            u_p2: uidata.p2,
            u_H: this.parent.H.front,

            a_position: this.positions,
            a_uv: this.uvs,
            u_transform: transform,
            u_color: this.loading_color
        });
    }
}

export { CrossSection };