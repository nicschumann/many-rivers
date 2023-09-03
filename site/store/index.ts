import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type UIData = {
    render_flux: boolean
    render_flux_magnitude: boolean
    render_curvature: boolean
    render_erosion_accretion: boolean
    render_slope: boolean

    p1: [number, number]
    p2: [number, number]

    flux_magnitude_scale: number
    saturation_point: number
}

export type SimulationState = {
    running: boolean
    eroding: boolean
    
    non_erosive_timesteps: number
    water_updates_per_iteration: number
    smoothing_iterations: number
    flux_averaging_steps: number
    updates_per_frame: number
}

export type SimulationParameters = {
    erosion_speed: number
    accretion_speed: number
    accretion_upper_bound:number
    erosion_lower_bound: number
    min_failure_slope: number
}

export type SimulationData = {
    state: SimulationState
    parameters: SimulationParameters
}

type State = {
    ui: UIData
    sim: SimulationData
}

type Actions = {
    setSimState: (state: SimulationState) => void
}

export const useApplicationState = create(
    immer<State & Actions>((set, get) => ({
        ui: {
            render_flux: false,
            render_flux_magnitude: false,
            render_curvature: false,
            render_erosion_accretion: false,
            render_slope: false,

            p1: [0.0, 0.5],
            p2:  [1.0, 0.5],

            flux_magnitude_scale: 10,
            saturation_point: 0.0
        },
        sim: {
            state: {
                running: false,
                eroding: true,

                non_erosive_timesteps: 500,
                water_updates_per_iteration: 20,
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
            }  
        },

        setSimState(newSimulationState: SimulationState) {
            set((state) => {
                const newState = {
                    ...state.sim.state,
                    ...newSimulationState
                }

                console.log(newState)

                state.sim.state = newState
            })            
        },
    }))
)