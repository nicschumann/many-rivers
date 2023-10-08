import { mat3, vec2 } from "gl-matrix";

import { View2D } from "./view2d";
import { View3D } from "./view3d";
import { CrossSection } from "./section.js";
import { Simulation } from "./simulation";
import { Camera } from "./camera.js";

import { TERRAIN_SIZE, RENDER_SCALE, TARGET_FRAMETIME } from "./constants";
import { SimulationData, UIData } from "@/store/index.js";
import { Regl } from "regl";
import { CompiledDrawCalls } from "./compile.js";
import { View } from "./view.js";
import { InputAPI } from "./inputs";
import { River } from "./data/rivers";

export type RenderResources = {
  last_mouse_coords: vec2;
  dt: number;
  t: number;
  camera: Camera;
  transform_2d: mat3;
  water_volume: number;
};

class RenderContext {
  regl: Regl;
  shaders: CompiledDrawCalls;
  simulation: Simulation;
  views: View[];
  resources: RenderResources;
  tile_center: vec2;

  constructor(river: River, regl: Regl, shaders: CompiledDrawCalls) {
    if (typeof shaders == "undefined") {
      console.error("No Shaders Supplied to RenderContext.");
    }
    if (typeof regl == "undefined") {
      console.error("No Regl instance Supplied to RenderContext.");
    }

    this.regl = regl;
    this.shaders = shaders;

    // erosion speed: 0.02, accretion speed: 0.01
    this.simulation = new Simulation(
      river.terrain_url, // terrain map
      river.boundary_url, // boundary map
      false, // is this a testcase?
      shaders,
      regl
    );

    this.views = [
      // base map
      new View3D(0, 0, 0, true, shaders, regl),

      // top-left minimaps
      // new View2D(-0.87, -0.8, 0, true, shaders, regl),
      // new CrossSection(0.2, -0.8, 0, true, shaders, regl),

      // // bottom-right minimaps
      // new View2D(0.87, 0.8, 0, true, shaders, regl),
      // new CrossSection(1.87, 0.8, 0, true, shaders, regl),
    ];

    this.views[0].active = true;
    this.views.forEach((t) => t.set_parent(this.simulation));

    this.resources = {
      last_mouse_coords: [0, 0],
      dt: TARGET_FRAMETIME,
      t: 0.0,
      camera: new Camera(
        [this.views[0].x - 0.2, 0.5, this.views[0].y - 0.2], // position

        [0.5, 0.0, 0.5] // target
      ),
      transform_2d: mat3.create(),
      water_volume: 0,
    };

    // NOTE(Nic): sets a random view when the context is created
    this.resources.camera.set_random_spherical_position();

    this.tile_center = [this.views[0].x + 1.0, this.views[0].y + 0.5];

    this.setup_transform();
    this.simulation.get_resources();
    this.views.forEach((t) => t.get_resources());
  }

  handle_input(input: InputAPI) {
    let pos = input.mouse_pos();

    // console.log(pos)

    // if (input.mouse_is_down(0) && !input.key_is_down('Shift') ) {
    //     // @ts-ignore
    //     let [dx, dy] = vec2.sub([], pos, this.resources.last_mouse_coords)

    //     this.update_center([
    //         -dx / window.innerWidth * 2.0 * (1 / RENDER_SCALE),
    //         -dy / window.innerHeight * 2.0 * (1 / RENDER_SCALE)
    //     ]);
    // }

    this.resources.last_mouse_coords = pos;

    this.resources.camera.handle_input(input);
  }

  reset(tile: Simulation | null = null) {
    if (tile !== null) {
      this.simulation = tile;
    }

    this.setup_transform();
    this.simulation.get_resources();
    this.views.forEach((t) => t.set_parent(this.simulation));
    this.views.forEach((t) => t.get_resources());
    this.resources.t = 0;
  }

  setup_transform() {
    let viewport = [window.innerWidth, window.innerHeight];

    let scalefactors = [
      (2 * TERRAIN_SIZE[0]) / viewport[0],
      (-2 * TERRAIN_SIZE[1]) / viewport[1],
    ];

    let T_trans = mat3.fromTranslation(
      // @ts-ignore
      [],
      [-this.tile_center[0], -this.tile_center[1]]
    );

    // @ts-ignore
    let T_scale = mat3.fromScaling([], scalefactors);

    // @ts-ignore
    this.resources.transform_2d = mat3.multiply([], T_scale, T_trans);
  }

  render_tiles(simdata: SimulationData, uidata: UIData) {
    let s = performance.now();

    this.simulation.simulate(this.resources, simdata);
    this.resources.camera.step(this.resources, simdata);

    this.views.forEach((view) => {
      this.regl.clear({ depth: 1.0 });
      view.render(this.resources, simdata, uidata);
    });

    this.resources.t += simdata.state.running ? 1 : 0;

    // let e = performance.now();
    // console.log(`total render: ${e - s}ms`);
  }

  update_center([d_x, d_y]: number[]) {
    this.tile_center[0] += d_x;
    this.tile_center[1] += d_y;
  }
}

export { RenderContext };
