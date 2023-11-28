import { SimulationData, UIData, UIOverlayState } from "@/store";
import { RenderResources } from "./context";
import { View, assert_parent, parent_exists } from "./view";
import { assert_simulation_buffer, buffer_exists } from "./simulation";

class View3D extends View {
  render(resources: RenderResources, simdata: SimulationData, uidata: UIData) {
    if (
      parent_exists(this.parent) &&
      this.parent?.loaded &&
      buffer_exists(this.parent.N) &&
      buffer_exists(this.parent.H) &&
      buffer_exists(this.parent.Q) &&
      buffer_exists(this.parent.K) &&
      buffer_exists(this.parent.E) &&
      buffer_exists(this.parent.S)
    ) {
      assert_parent(this.parent);
      assert_simulation_buffer(this.parent.N);
      assert_simulation_buffer(this.parent.H);
      assert_simulation_buffer(this.parent.Q);
      assert_simulation_buffer(this.parent.K);
      assert_simulation_buffer(this.parent.E);
      assert_simulation_buffer(this.parent.S);

      this.regl.clear({ depth: 1.0 });
      let PV = resources.camera.get_matrix();

      this.shaders.calculate_N_normals({
        target: this.parent.N.buffer,
        a_uv: this.uvs,
        u_H: this.parent.H.front,
      });

      if (uidata.active_overlay == UIOverlayState.LandscapeView) {
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

      if (uidata.active_overlay == UIOverlayState.SimulationView) {
        if (uidata.render_dry) {
          this.shaders.render_domain_wireframe({
            u_basepoint: [this.x, 0.0, this.y],
            u_transform: PV,

            u_H: this.parent.H.front,
            u_N: this.parent.N.buffer,

            u_color_contrast: uidata.color_contrast,
            u_color_normalization: uidata.color_normalization,
          });
        }

        if (uidata.render_wet) {
          this.shaders.render_river_wireframe({
            u_basepoint: [this.x, 0.0, this.y],
            u_transform: PV,

            u_H: this.parent.H.front,
            u_N: this.parent.N.buffer,
            u_view_pos: resources.camera.position,
            u_y_offset: 0.0,
          });
        }
      }

      if (uidata.active_overlay == UIOverlayState.DebugView) {
        this.shaders.render_sim_mesh_base({
          u_basepoint: [this.x, 0.0, this.y],
          u_transform: PV,

          u_H: this.parent.H.front,
          u_N: this.parent.N.buffer,
          u_view_pos: resources.camera.position,
          u_y_offset: 0.0,
          u_alpha: 1.0,
        });

        this.shaders.render_sim_mesh_volumes({
          u_basepoint: [this.x, 0.0, this.y],
          u_transform: PV,

          u_H: this.parent.H.front,
          u_N: this.parent.N.buffer,
          u_view_pos: resources.camera.position,
          u_y_offset: 0.0,
          u_alpha: 1.0,
        });

        this.shaders.render_sim_mesh_edges({
          u_basepoint: [this.x, 0.0, this.y],
          u_transform: PV,

          u_H: this.parent.H.front,
          u_N: this.parent.N.buffer,
          u_view_pos: resources.camera.position,
          u_y_offset: 0.0,
          u_alpha: 1.0,
        });
      }

      // THIS IS DEBUG STUFF
      // const base_height = 1;
      // let current_height = base_height;

      // if (
      //   uidata.render_depth &&
      //   uidata.active_overlay == UIOverlayState.DebugTools
      // ) {
      //   this.shaders.render_river_depth({
      //     u_basepoint: [this.x, 0.0, this.y],
      //     u_transform: PV,

      //     u_H: this.parent.H.front,
      //     u_N: this.parent.N.buffer,
      //     u_Q: this.parent.Q.front,
      //     u_view_pos: resources.camera.position,
      //     u_saturation_point: uidata.saturation_point,
      //     u_y_offset: current_height,
      //   });

      //   current_height += base_height;
      // }

      // if (
      //   uidata.render_curvature &&
      //   uidata.active_overlay == UIOverlayState.DebugTools
      // ) {
      //   this.shaders.render_river_curvature({
      //     u_basepoint: [this.x, 0.0, this.y],
      //     u_transform: PV,

      //     u_H: this.parent.H.front,
      //     u_K: this.parent.K.front,
      //     u_E: this.parent.E.front,
      //     u_view_pos: resources.camera.position,
      //     u_saturation_point: uidata.saturation_point,
      //     u_y_offset: current_height,
      //   });

      //   current_height += base_height;
      // }

      // if (
      //   uidata.render_erosion_accretion &&
      //   uidata.active_overlay == UIOverlayState.DebugTools
      // ) {
      //   this.shaders.render_river_erosion_accretion({
      //     u_basepoint: [this.x, 0.0, this.y],
      //     u_transform: PV,

      //     u_H: this.parent.H.front,
      //     u_K: this.parent.K.front,
      //     u_Q: this.parent.Q.front,
      //     u_S: this.parent.S.buffer,

      //     u_k_erosion: simdata.parameters.erosion_speed,
      //     u_k_accretion: simdata.parameters.accretion_speed,
      //     u_Q_accretion_upper_bound: simdata.parameters.accretion_upper_bound,
      //     u_Q_erosion_lower_bound: simdata.parameters.erosion_lower_bound,

      //     u_view_pos: resources.camera.position,
      //     u_saturation_point: uidata.saturation_point,
      //     u_y_offset: current_height,
      //   });

      //   current_height += base_height;
      // }

      // if (
      //   uidata.render_flux &&
      //   uidata.active_overlay == UIOverlayState.DebugTools
      // ) {
      //   this.shaders.render_river_flux({
      //     u_basepoint: [this.x, 0.0, this.y],
      //     u_transform: PV,

      //     u_H: this.parent.H.front,
      //     u_N: this.parent.N.buffer,
      //     u_Q: this.parent.Q.front,
      //     u_view_pos: resources.camera.position,
      //     u_saturation_point: uidata.saturation_point,
      //     u_y_offset: current_height,
      //   });

      //   current_height += base_height;
      // }
    } else if (parent_exists(this.parent) && !this.parent?.loaded) {
      // If we're still waiting for textures...
      // super.render(resources, parameters);
    }
  }
}

export { View3D };
