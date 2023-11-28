import { SimulationData, UIData } from "@/store";
import { View, assert_parent, parent_exists } from "./view";
import { RenderResources } from "./context";
import { assert_simulation_buffer, buffer_exists } from "./simulation";

class View2D extends View {
  render(resources: RenderResources, simdata: SimulationData, uidata: UIData) {
    if (
      parent_exists(this.parent) &&
      this.parent?.loaded &&
      this.active &&
      buffer_exists(this.parent.H) &&
      buffer_exists(this.parent.Q) &&
      buffer_exists(this.parent.S) &&
      buffer_exists(this.parent.K) &&
      buffer_exists(this.parent.E)
    ) {
      assert_simulation_buffer(this.parent.H);
      assert_simulation_buffer(this.parent.Q);
      assert_simulation_buffer(this.parent.S);
      assert_simulation_buffer(this.parent.K);
      assert_simulation_buffer(this.parent.E);

      // 2D RENDERING STEPS:
      let transform = resources.transform_2d;

      this.regl.clear({ depth: 1.0 });
      this.shaders.render_terrain_height({
        u_H: this.parent.H.front,
        u_scalefactor: 0.5,
        u_saturation_point: uidata.saturation_point,

        a_position: this.positions,
        a_uv: this.uvs,
        u_transform: transform,
      });

      if (uidata.render_flux) {
        this.regl.clear({ depth: 1.0 });
        this.shaders.render_flux({
          u_Q: this.parent.Q.front,
          u_H: this.parent.H.front,
          u_scalefactor: 0.5,

          a_position: this.positions,
          a_uv: this.uvs,
          u_transform: transform,
        });
      }

      if (uidata.render_flux_magnitude) {
        this.regl.clear({ depth: 1.0 });
        this.shaders.render_flux_magnitude({
          u_Q: this.parent.Q.front,
          u_H: this.parent.H.front,
          u_scalefactor: 0.5,
          u_flux_magnitude_scale: uidata.flux_magnitude_scale,

          a_position: this.positions,
          a_uv: this.uvs,
          u_transform: transform,
        });
      }

      if (uidata.render_slope) {
        this.regl.clear({ depth: 1.0 });
        this.shaders.render_slope({
          u_S: this.parent.S.buffer,
          u_K: this.parent.K.front,
          u_scalefactor: 4.0,

          a_position: this.positions,
          a_uv: this.uvs,
          u_transform: transform,
        });
      }

      if (uidata.render_curvature) {
        this.regl.clear({ depth: 1.0 });
        this.shaders.render_curvature({
          u_H: this.parent.H.front,
          u_K: this.parent.K.front,
          u_E: this.parent.E.front,
          u_scalefactor: 4.0,

          a_position: this.positions,
          a_uv: this.uvs,
          u_transform: transform,
        });
      }

      if (uidata.render_erosion_accretion) {
        this.regl.clear({ depth: 1.0 });
        this.shaders.render_erosion_accretion({
          u_H: this.parent.H.front,
          u_K: this.parent.K.front,
          u_Q: this.parent.Q.front,
          u_S: this.parent.S.buffer,

          u_k_erosion: simdata.parameters.erosion_speed,
          u_k_accretion: simdata.parameters.accretion_speed,
          u_Q_accretion_upper_bound: simdata.parameters.accretion_upper_bound,
          u_Q_erosion_lower_bound: simdata.parameters.erosion_lower_bound,

          u_scalefactor: 4.0,

          a_position: this.positions,
          a_uv: this.uvs,
          u_transform: transform,
        });
      }

      // this.regl.clear({depth: 1.0});
      // this.shaders.render_section_line({
      //     u_p1: uidata.p1,
      //     u_p2: uidata.p2,
      //     u_color: [0.65, 0.2, 0.0],
      //     a_position: this.positions,
      //     a_uv: this.uvs,
      //     u_transform: transform,
      // })
    } else if (parent_exists(this.parent) && !this.parent?.loaded) {
      console.log("still loading!");
      // If we're still waiting for textures...
      super.render(resources, simdata, uidata);
    }
  }
}

export { View2D };
