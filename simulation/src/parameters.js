export default {
    // debug view options
    render_flux: false,
    render_flux_magnitude: false,
    render_curvature: false,
    render_erosion_accretion: false,
    render_slope: false,

    // simulation update options
    running: false,
    run_erosion: true,

    // cross-section point placement
    p1: [0.0, 0.5],
    p2: [1.0, 0.5],

    non_erosive_timesteps: 150,
    smoothing_iterations: 40,
    flux_averaging_steps: 0,
    updates_per_frame: 50,

    k_erosion: 0.00004, // 4x faster than accretion in this mode.
    k_accretion: 0.00001, 
    // accretion_upper_bound: 0.014,
    accretion_upper_bound: 0.0005,
    erosion_lower_bound: 0.02,
    min_failure_slope: 100.0,

    // 
    flux_magnitude_scale: 30,
    saturation_point: 0.0
};