import { Regl } from "regl";
import { CompiledDrawCalls } from "./compile";
import { Simulation } from "./simulation";
import { RenderResources } from "./context";
import { SimulationData, UIData } from "@/store";

function assert_parent(parent: unknown): asserts parent {
  if (typeof parent == "undefined") {
    throw new Error("Parent simulation not set on View; call set_parent.");
  }
}

class View {
  is_testcase: boolean;
  active: boolean = false;

  shaders: CompiledDrawCalls;
  regl: Regl;
  x: number;
  y: number;
  z: number;

  parent?: Simulation;

  positions: number[][];
  uvs: number[][];

  loading_color = [0 / 255, 74 / 255, 74 / 255];
  loaded = false;

  constructor(
    x: number,
    y: number,
    z: number,
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

    this.is_testcase = testcase;
    this.shaders = shaders;
    this.regl = regl;

    this.x = x;
    this.y = y;
    this.z = z;

    this.positions = [
      [this.x, this.y],
      [this.x + 1, this.y],
      [this.x, this.y + 1],
      [this.x + 1, this.y + 1],
    ];

    this.uvs = [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ];
  }

  update_positions() {
    this.positions = [
      [this.x, this.y],
      [this.x + 1, this.y],
      [this.x, this.y + 1],
      [this.x + 1, this.y + 1],
    ];
  }

  set_parent(parent: Simulation) {
    this.parent = parent;
    // this.x = parent.x;
    // this.y = parent.y;
    // this.z = parent.z;
    // this.update_positions();
  }

  get_resources(simdata: SimulationData) {}

  render(resources: RenderResources, simdata: SimulationData, uidata: UIData) {
    this.shaders.render_tile_as_color({
      a_position: this.positions,
      a_uv: this.uvs,
      u_transform: resources.transform_2d,
      u_color: this.loading_color,
    });
  }
}

export { View, assert_parent };
