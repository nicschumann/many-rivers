import { TILE_SIZE, DEFAULT_INTERPOLATION } from "./constants";
import { DoubleFramebuffer, SingleFramebuffer } from "./buffer";
import { CompiledDrawCalls } from "./compile";
import { Regl, Texture2D } from "regl";
import { SimulationData, SimulationParameters } from "@/store";
import { RenderResources } from "./context";

const load_image = (url: string) => {
  return new Promise((accept, reject) => {
    const img = new Image();
    img.onload = () => {
      createImageBitmap(img).then(accept);
    };

    img.onerror = reject;
    img.crossOrigin = "anonymous";
    img.src = url;
  });
};

function assert_simulation_buffer(buffer: unknown): asserts buffer {
  if (typeof buffer == "undefined") {
    throw new Error("Uninitialized Buffers; call get_resources.");
  }
}

class Simulation {
  terrain_url: string;
  boundary_url: string;
  is_testcase: boolean;
  loaded: boolean;
  t: number;

  shaders: CompiledDrawCalls;
  regl: Regl;

  elevation?: Texture2D;
  boundary?: Texture2D;

  H?: DoubleFramebuffer;
  K?: DoubleFramebuffer;
  E?: DoubleFramebuffer;
  S?: SingleFramebuffer;
  N?: SingleFramebuffer;
  Q?: DoubleFramebuffer;

  constructor(
    terrain_url: string,
    boundary_url: string,
    testcase = false,
    shaders: CompiledDrawCalls,
    regl: Regl
  ) {
    if (typeof shaders == "undefined") {
      console.error("No Shaders Supplied to RenderContext.");
    }
    if (typeof regl == "undefined") {
      console.error("No Regl instance Supplied to RenderContext.");
    }

    this.shaders = shaders;
    this.regl = regl;

    this.terrain_url = terrain_url;
    this.boundary_url = boundary_url;
    this.is_testcase = testcase;

    this.loaded = false;
    this.t = 0.0;
  }

  async get_resources(simdata: SimulationParameters) {
    // NOTE(Nic): Factor this so that it just wants Float32Array of the right length?
    // NOTE(Nic): Pull out TILE_SIZE as a parameter to this module?

    let textures = (await Promise.all([
      load_image(`/${this.terrain_url}`),
      load_image(`/${this.boundary_url}`),
    ])) as HTMLImageElement[];

    this.elevation = this.regl.texture({
      data: textures[0],
      mag: DEFAULT_INTERPOLATION,
      min: DEFAULT_INTERPOLATION,
    });
    this.boundary = this.regl.texture({
      data: textures[1],
      mag: DEFAULT_INTERPOLATION,
      min: DEFAULT_INTERPOLATION,
    });

    const curvature_scale_factor = 1.0;
    // these buffers are aligned to the H grid
    this.H = new DoubleFramebuffer(this.regl, TILE_SIZE); // height map
    this.K = new DoubleFramebuffer(this.regl, [
      TILE_SIZE[0] / curvature_scale_factor,
      TILE_SIZE[1] / curvature_scale_factor,
    ]); // curvature buffer
    this.E = new DoubleFramebuffer(this.regl, [
      TILE_SIZE[0] / curvature_scale_factor,
      TILE_SIZE[1] / curvature_scale_factor,
    ]); // Edge Map
    this.S = new SingleFramebuffer(this.regl, TILE_SIZE); // slope buffer
    this.N = new SingleFramebuffer(this.regl, TILE_SIZE);

    // these buffers are aligned to the Q grid
    this.Q = new DoubleFramebuffer(this.regl, TILE_SIZE); // flux buffer

    if (this.is_testcase) {
      this.shaders.calculate_testcase_initial_conditions({
        target: this.H.front,
        u_elevation: this.elevation,
      });
    } else {
      this.shaders.calculate_initial_conditions({
        target: this.H.front,

        u_elevation: this.elevation,
        u_boundary: this.boundary,
        u_water_depth: simdata.initial_water,
      });
    }

    this.loaded = true;
  }

  simulate(resources: RenderResources, simdata: SimulationData) {
    if (simdata.state.running && this.loaded) {
      assert_simulation_buffer(this.H);
      assert_simulation_buffer(this.K);
      assert_simulation_buffer(this.E);
      assert_simulation_buffer(this.S);
      assert_simulation_buffer(this.N);
      assert_simulation_buffer(this.Q);

      let s = performance.now();
      for (let i = 0; i < simdata.state.updates_per_frame; i++) {
        // update Q
        this.shaders.calculate_slope_field({
          target: this.S.buffer,
          u_H: this.H.front,
        });

        this.shaders.calculate_flow_field({
          target: this.Q.back,
          u_H: this.H.front,
          u_S: this.S.buffer,
        });
        this.Q.swap();

        // single averaging step
        for (let i = 0; i < simdata.state.flux_averaging_steps; i++) {
          this.shaders.calculate_flow_field_averaging({
            target: this.Q.back,
            u_Q: this.Q.front,
          });
          this.Q.swap();
        }

        // Snippet fro reading piexles from a given framebuffer
        // const data = new Float32Array(TILE_SIZE.reduce((a,b) => a*b) * 4.0);
        // this.H.front.use(() => {
        //     regl.read({ data });
        //     // data now contains all of the framebuffer values.
        // });

        // this averaging system is appropriate with
        // stream-averaging-2, which iteratively solved
        // a laplace equation across the river domain.
        let render_iterations_per_smoothing = 50;
        if (
          i % simdata.state.smoothing_iterations == 0 &&
          resources.t % render_iterations_per_smoothing == 0
        ) {
          // update edges
          this.shaders.calculate_edges({
            target: this.E.back,
            u_H: this.H.front,
          });
          this.E.swap();

          // calculate_edge_normalization_pass_one({
          //     target: this.E.back,
          //     u_E: this.E.front,
          //     a_uv: this.uvs
          // });
          // this.E.swap();

          // calculate_edge_normalization_pass_two({
          //     target: this.E.back,
          //     u_E: this.E.front,
          //     a_uv: this.uvs
          // });
          // this.E.swap();

          // update Kappa
          this.shaders.calculate_curvature({
            target: this.K.back,
            u_H: this.H.front,
            u_E: this.E.front,
          });
          this.K.swap();

          // averaging passes.

          for (let i = 0; i < simdata.state.smoothing_iterations; i++) {
            this.shaders.calculate_edge_averaging({
              target: this.K.back,
              u_K: this.K.front,
              u_E: this.E.front,
              u_H: this.H.front,
            });
            this.K.swap();
          }

          for (let j = 0; j < simdata.state.smoothing_iterations; j++) {
            this.shaders.calculate_stream_averaging({
              target: this.K.back,
              u_K: this.K.front,
              u_E: this.E.front,
              u_H: this.H.front,
            });
            this.K.swap();
          }
        }

        // calculate erosion and collapse.
        if (
          simdata.state.eroding &&
          resources.t > simdata.state.non_erosive_timesteps &&
          i % simdata.state.water_updates_per_iteration == 0
        ) {
          this.shaders.calculate_erosion_accretion({
            target: this.H.back,
            u_Q: this.Q.front,
            u_H: this.H.front,
            u_K: this.K.front,
            u_S: this.S.buffer,

            u_k_erosion: simdata.parameters.erosion_speed,
            u_k_accretion: simdata.parameters.accretion_speed,
            u_Q_accretion_upper_bound: simdata.parameters.accretion_upper_bound,
            u_Q_erosion_lower_bound: simdata.parameters.erosion_lower_bound,
          });
          this.H.swap();

          this.shaders.calculate_collapse({
            target: this.H.back,
            u_Q: this.Q.front,
            u_H: this.H.front,
            u_K: this.K.front,
            u_S: this.S.buffer,

            u_k_erosion: simdata.parameters.erosion_speed,
            u_k_accretion: simdata.parameters.accretion_speed,
            u_Q_accretion_upper_bound: simdata.parameters.accretion_upper_bound,
            u_Q_erosion_lower_bound: simdata.parameters.erosion_lower_bound,
            u_min_failure_slope: simdata.parameters.min_failure_slope,
          });
          this.H.swap();
        }

        // update H
        this.shaders.advance_water_depth({
          target: this.H.back,
          u_Q: this.Q.front,
          u_H: this.H.front,
          u_K: this.K.front,
          u_clamp_water: (resources.t + i) % 50 == 0,
        });

        this.H.swap();

        // enforce boundary conditions
        // calculate_H_boundary_conditions({
        //     target: this.H.back,
        //     u_boundary: (this.is_testcase) ? this.elevation : this.boundary,
        //     u_H: this.H.front,
        //     u_upper_bank: parameters.upper_bank,
        //     u_lower_bank: parameters.lower_bank,
        //     u_bank_width: parameters.bank_width,
        //     u_sediment_height_max: parameters.sediment_height_max,
        //     u_sediment_height_min: parameters.sediment_height_min,
        //     a_uv: this.uvs,
        // })
        // this.H.swap();

        this.shaders.calculate_Q_boundary_conditions({
          target: this.Q.back,
          u_Q: this.Q.front,
          u_boundary: this.boundary,
        });
        this.Q.swap();
      }
      let e = performance.now();
      let avg_update_time = (e - s) / simdata.state.updates_per_frame;
      // console.log(`${resources.t} ${parameters.updates_per_frame} updates: ${e - s}ms (${avg_update_time.toFixed(3)}ms / step)`);
      if (resources.t % 200 == 0) {
        this.H.front.use(() => {
          const fb = this.regl.read();
          let water_m3 = 0;
          for (let i = 0; i < fb.length; i += 1) {
            if (i % 4 == 2) {
              // blue channel
              water_m3 += fb[i] > 0.01 ? 1 : 0;
            }
          }

          resources.water_volume = water_m3;
        });
      }
    }
  }

  destroy() {}
}

export { Simulation, assert_simulation_buffer };
