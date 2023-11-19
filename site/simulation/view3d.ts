import { SimulationData, UIData, UIOverlayState } from "@/store";
import { RenderResources } from "./context";
import { View, assert_parent } from "./view";
import { assert_simulation_buffer } from "./simulation";
import { vec3 } from "gl-matrix";

class View3D extends View {
  render(resources: RenderResources, simdata: SimulationData, uidata: UIData) {
    assert_parent(this.parent);
    assert_simulation_buffer(this.parent.N);
    assert_simulation_buffer(this.parent.H);
    assert_simulation_buffer(this.parent.Q);
    assert_simulation_buffer(this.parent.K);
    assert_simulation_buffer(this.parent.E);
    assert_simulation_buffer(this.parent.S);

    if (this.parent.loaded) {
      // 3D RENDERING STEPS
      // console.log('render');
      this.regl.clear({ depth: 1.0 });

      let PV = resources.camera.get_matrix();

      this.shaders.calculate_N_normals({
        target: this.parent.N.buffer,
        a_uv: this.uvs,
        u_H: this.parent.H.front,
      });

      if (uidata.active_overlay == UIOverlayState.DroneView) {
        this.shaders.render_domain({
          u_basepoint: [this.x, 0.0, this.y],
          u_transform: PV,

          u_H: this.parent.H.front,
          u_N: this.parent.N.buffer,

          u_color_contrast: uidata.color_contrast,
          u_color_normalization: uidata.color_normalization,
        });

        this.shaders.render_river({
          u_basepoint: [this.x, 0.0, this.y],
          u_transform: PV,

          u_H: this.parent.H.front,
          u_N: this.parent.N.buffer,
          u_view_pos: resources.camera.position,
          u_y_offset: 0.0,
        });
      }

      // const camera_dist = vec3.distance(resources.camera.position, [0.5, 0, 0.5])

      if (uidata.active_overlay == UIOverlayState.SimTools) {
        this.shaders.render_sim_mesh({
          u_basepoint: [this.x, 0.0, this.y],
          u_transform: PV,

          u_H: this.parent.H.front,
          u_N: this.parent.N.buffer,
          u_view_pos: resources.camera.position,
          u_y_offset: 0.0,
          u_alpha: 0.4,

          render_type: "triangles",
        });

        this.shaders.render_sim_mesh({
          u_basepoint: [this.x, 0.0, this.y],
          u_transform: PV,

          u_H: this.parent.H.front,
          u_N: this.parent.N.buffer,
          u_view_pos: resources.camera.position,
          u_y_offset: 0.0,
          u_alpha: 1.0,

          render_type: "lines",
        });
      }

      // THIS IS DEBUG STUFF
      const base_height = 1;
      let current_height = base_height;

      if (
        uidata.render_depth &&
        uidata.active_overlay == UIOverlayState.DebugView
      ) {
        this.shaders.render_river_depth({
          u_basepoint: [this.x, 0.0, this.y],
          u_transform: PV,

          u_H: this.parent.H.front,
          u_N: this.parent.N.buffer,
          u_Q: this.parent.Q.front,
          u_view_pos: resources.camera.position,
          u_saturation_point: uidata.saturation_point,
          u_y_offset: current_height,
        });

        current_height += base_height;
      }

      if (
        uidata.render_curvature &&
        uidata.active_overlay == UIOverlayState.DebugView
      ) {
        this.shaders.render_river_curvature({
          u_basepoint: [this.x, 0.0, this.y],
          u_transform: PV,

          u_H: this.parent.H.front,
          u_K: this.parent.K.front,
          u_E: this.parent.E.front,
          u_view_pos: resources.camera.position,
          u_saturation_point: uidata.saturation_point,
          u_y_offset: current_height,
        });

        current_height += base_height;
      }

      if (
        uidata.render_erosion_accretion &&
        uidata.active_overlay == UIOverlayState.DebugView
      ) {
        this.shaders.render_river_erosion_accretion({
          u_basepoint: [this.x, 0.0, this.y],
          u_transform: PV,

          u_H: this.parent.H.front,
          u_K: this.parent.K.front,
          u_Q: this.parent.Q.front,
          u_S: this.parent.S.buffer,

          u_k_erosion: simdata.parameters.erosion_speed,
          u_k_accretion: simdata.parameters.accretion_speed,
          u_Q_accretion_upper_bound: simdata.parameters.accretion_upper_bound,
          u_Q_erosion_lower_bound: simdata.parameters.erosion_lower_bound,

          u_view_pos: resources.camera.position,
          u_saturation_point: uidata.saturation_point,
          u_y_offset: current_height,
        });

        current_height += base_height;
      }

      if (
        uidata.render_flux &&
        uidata.active_overlay == UIOverlayState.DebugView
      ) {
        this.shaders.render_river_flux({
          u_basepoint: [this.x, 0.0, this.y],
          u_transform: PV,

          u_H: this.parent.H.front,
          u_N: this.parent.N.buffer,
          u_Q: this.parent.Q.front,
          u_view_pos: resources.camera.position,
          u_saturation_point: uidata.saturation_point,
          u_y_offset: current_height,
        });

        current_height += base_height;
      }
    } else if (!this.parent.loaded) {
      // If we're still waiting for textures...
      // super.render(resources, parameters);
    }
  }
}

export { View3D };
