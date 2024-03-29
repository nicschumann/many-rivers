import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export enum UIOverlayState {
  LandscapeView = 0,
  SimulationView = 1,
  DebugView = 2,
  None = 3,
}

export enum UIOverlayVisibility {
  Complete = 0,
  Freelook = 1,
  Hidden = 2,
  Overlay = 3,
}

export enum CameraAnimationType {
  Perspective = 0,
  Top = 1,
}

export type AnimationState = {
  type: CameraAnimationType;
  requested: boolean;
  handled: boolean;
};

export type UIData = {
  active_overlay: UIOverlayState;
  overlay_visibility: UIOverlayVisibility;

  render_depth: boolean;
  render_flux: boolean;
  render_flux_magnitude: boolean;
  render_curvature: boolean;
  render_erosion_accretion: boolean;
  render_slope: boolean;
  render_dry: boolean;
  render_wet: boolean;

  p1: [number, number];
  p2: [number, number];

  flux_magnitude_scale: number;
  saturation_point: number;

  normalization_factor: number;
  color_contrast: number;
  color_normalization: number;
};

export type SimulationState = {
  loaded: boolean;
  running: boolean;
  eroding: boolean;

  non_erosive_timesteps: number;
  water_updates_per_iteration: number;
  smoothing_iterations: number;
  flux_averaging_steps: number;
  updates_per_frame: number;
};

export type SimulationParameters = {
  erosion_speed: number;
  accretion_speed: number;
  accretion_upper_bound: number;
  erosion_lower_bound: number;
  min_failure_slope: number;
  initial_water: number;
};

export type SimulationData = {
  name: string;
  state: SimulationState;
  parameters: SimulationParameters;
};

type State = {
  ui: UIData;
  sim: SimulationData;
  cam: AnimationState;
};

type Actions = {
  setUIState: (stateUpdate: Partial<UIData>) => void;
  setSimState: (stateUpdate: Partial<SimulationState>) => void;
  setSimName: (stateUpdate: string) => void;
  setSimParameters: (stateUpdate: Partial<SimulationParameters>) => void;
  setCamState: (stateUpdate: Partial<AnimationState>) => void;
};

export const useApplicationState = create(
  immer<State & Actions>((set, get) => ({
    ui: {
      active_overlay: UIOverlayState.LandscapeView,
      overlay_visibility: UIOverlayVisibility.Complete,

      render_depth: true,
      render_flux: false,
      render_flux_magnitude: false,
      render_curvature: false,
      render_erosion_accretion: false,
      render_slope: false,
      render_dry: true,
      render_wet: true,

      p1: [0.0, 0.5],
      p2: [1.0, 0.5],

      flux_magnitude_scale: 10,
      saturation_point: 0.0,

      normalization_factor: 20.0,
      color_contrast: 6.0,
      color_normalization: 5.0,
    },
    sim: {
      name: "",
      state: {
        loaded: false,
        running: true,
        eroding: true,

        non_erosive_timesteps: 500,
        water_updates_per_iteration: 100,
        smoothing_iterations: 40,
        flux_averaging_steps: 0,
        updates_per_frame: 50,
      },
      parameters: {
        erosion_speed: 0.02, // try 0.0002 or 0.0003 at average depths of 3m
        accretion_speed: 0.018,
        // accretion_upper_bound: 0.014,
        accretion_upper_bound: 0.001,
        erosion_lower_bound: 0.05,
        min_failure_slope: 80.0,
        initial_water: 2.0,
      },
    },
    cam: {
      type: CameraAnimationType.Perspective,
      requested: false,
      handled: false,
    },

    setSimName(nameUpdate: string) {
      set((state) => {
        state.sim.name = nameUpdate;
      });
    },

    setUIState(stateUpdate: Partial<UIData>) {
      set((state) => {
        const newState = {
          ...state.ui,
          ...stateUpdate,
        };

        state.ui = newState;
      });
    },

    setSimState(stateUpdate: Partial<SimulationState>) {
      set((state) => {
        const newState = {
          ...state.sim.state,
          ...stateUpdate,
        };

        state.sim.state = newState;
      });
    },

    setSimParameters(stateUpdate: Partial<SimulationParameters>) {
      set((state) => {
        const newState = {
          ...state.sim.parameters,
          ...stateUpdate,
        };

        state.sim.parameters = newState;
      });
    },

    setCamState(stateUpdate: Partial<AnimationState>) {
      set((state) => {
        const newState = {
          ...state.cam,
          ...stateUpdate,
        };

        state.cam = newState;
      });
    },
  }))
);
