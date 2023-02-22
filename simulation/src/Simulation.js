import { TILE_SIZE, DEFAULT_INTERPOLATION } from './constants';
import { DoubleFramebuffer, SingleFramebuffer } from './buffer';


const load_image = (url) => {
    return new Promise((accept, reject) => {
        const img = new Image();
        img.onload = () => { 
            createImageBitmap(img).then(accept)            
        }
        
        img.onerror = reject;
        img.crossOrigin = 'anonymous';
        img.src = url;
    });
}

// GPU calls: initial conditions calculation
const calculate_initial_conditions = regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/calculate-H-initial-conditions-with-elevation.frag'),
    attributes: {
        a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        a_uv: [[0, 0], [1, 0], [0, 1], [1, 1]]
    },
    uniforms: {
        u_elevation: regl.prop('u_elevation'),
        u_boundary: regl.prop('u_boundary'),

        u_upper_bank: regl.prop('u_upper_bank'),
        u_lower_bank: regl.prop('u_lower_bank'),
        u_bank_width: regl.prop('u_bank_width'),
        u_sediment_height_max: regl.prop('u_sediment_height_max'),
        u_sediment_height_min: regl.prop('u_sediment_height_min'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4
})

const calculate_testcase_initial_conditions = regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/calculate-H-initial-conditions-testcase.frag'),
    attributes: {
        a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        a_uv: [[0, 0], [1, 0], [0, 1], [1, 1]]
    },
    uniforms: {
        u_elevation: regl.prop('u_elevation'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4
})



// GPU calls: update steps

const calculate_slope_field = regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/calculate-S-field.frag'),
    attributes: {
        a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        a_uv: [[0, 0], [1, 0], [0, 1], [1, 1]]
    },
    uniforms: {
        u_H: regl.prop('u_H'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4
})

const calculate_flow_field = regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/calculate-Q-field.frag'),
    attributes: {
        a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        a_uv: [[0, 0], [1, 0], [0, 1], [1, 1]]
    },
    uniforms: {
        u_H: regl.prop('u_H'),
        u_S: regl.prop('u_S'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4
});

const calculate_flow_field_averaging = regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/calculate-Q-averaging.frag'),
    attributes: {
        a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        a_uv: [[0, 0], [1, 0], [0, 1], [1, 1]]
    },
    uniforms: {
        u_Q: regl.prop('u_Q'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4
});


// curvature stuff:

const calculate_edges = regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/calculate-K-edge-field.frag'),
    attributes: {
        a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        a_uv: [[0, 0], [1, 0], [0, 1], [1, 1]]
    },
    uniforms: {
        u_H: regl.prop('u_H'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4
});

const calculate_edge_normalization_pass_one = regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/calculate-K-edge-normalization-1.frag'),
    attributes: {
        a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        a_uv: [[0, 0], [1, 0], [0, 1], [1, 1]]
    },
    uniforms: {
        u_H: regl.prop('u_H'),
        u_E: regl.prop('u_E'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4
});

const calculate_edge_normalization_pass_two = regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/calculate-K-edge-normalization-2.frag'),
    attributes: {
        a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        a_uv: [[0, 0], [1, 0], [0, 1], [1, 1]]
    },
    uniforms: {
        u_H: regl.prop('u_H'),
        u_E: regl.prop('u_E'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4
});

const calculate_curvature = regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/calculate-K-curvature-field.frag'),
    attributes: {
        a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        a_uv: [[0, 0], [1, 0], [0, 1], [1, 1]]
    },
    uniforms: {
        u_H: regl.prop('u_H'),
        u_E: regl.prop('u_E'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4
});

const calculate_edge_averaging = regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/calculate-K-edge-averaging.frag'),
    attributes: {
        a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        a_uv: [[0, 0], [1, 0], [0, 1], [1, 1]]
    },
    uniforms: {
        u_K: regl.prop('u_K'),
        u_E: regl.prop('u_E'),
        u_H: regl.prop('u_H'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4
});

const calculate_stream_averaging = regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/calculate-K-stream-averaging-2.frag'),
    attributes: {
        a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        a_uv: [[0, 0], [1, 0], [0, 1], [1, 1]]
    },
    uniforms: {
        u_K: regl.prop('u_K'),
        u_E: regl.prop('u_E'),
        u_H: regl.prop('u_H'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4
});

// end of curvature stuff

// sediment stuff

const calculate_erosion_accretion = regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/calculate-H-erosion-accretion-5.frag'),
    attributes: {
        a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        a_uv: [[0, 0], [1, 0], [0, 1], [1, 1]]
    },
    uniforms: {
        u_K: regl.prop('u_K'),
        u_H: regl.prop('u_H'),
        u_Q: regl.prop('u_Q'),
        u_S: regl.prop('u_S'),

        u_k_erosion: regl.prop('u_k_erosion'),
        u_k_accretion: regl.prop('u_k_accretion'),
        u_Q_accretion_upper_bound: regl.prop('u_Q_accretion_upper_bound'),
        u_Q_erosion_lower_bound: regl.prop('u_Q_erosion_lower_bound'),

        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4
});

const calculate_collapse = regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/calculate-H-collapse-2.frag'),
    attributes: {
        a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        a_uv: [[0, 0], [1, 0], [0, 1], [1, 1]]
    },
    uniforms: {
        u_K: regl.prop('u_K'),
        u_H: regl.prop('u_H'),
        u_Q: regl.prop('u_Q'),
        u_S: regl.prop('u_S'),

        u_k_erosion: regl.prop('u_k_erosion'),
        u_k_accretion: regl.prop('u_k_accretion'),
        u_Q_accretion_upper_bound: regl.prop('u_Q_accretion_upper_bound'),
        u_Q_erosion_lower_bound: regl.prop('u_Q_erosion_lower_bound'),
        u_min_failure_slope: regl.prop('u_min_failure_slope'),

        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4
});





const advance_water_depth = regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/calculate-H-depth-update.frag'),
    attributes: {
        a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        a_uv: [[0, 0], [1, 0], [0, 1], [1, 1]]
    },
    uniforms: {
        u_H: regl.prop('u_H'),
        u_Q: regl.prop('u_Q'),
        u_K: regl.prop('u_K'),
        u_clamp_water: regl.prop('u_clamp_water'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4
});


// GPU calls: boundary conditions
const calculate_H_boundary_conditions = regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/calculate-H-boundary-conditions-with-elevation.frag'),
    attributes: {
        a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        a_uv: [[0, 0], [1, 0], [0, 1], [1, 1]]
    },
    uniforms: {
        u_H: regl.prop('u_H'),
        u_boundary: regl.prop('u_boundary'),
        u_upper_bank: regl.prop('u_upper_bank'),
        u_lower_bank: regl.prop('u_lower_bank'),
        u_bank_width: regl.prop('u_bank_width'),
        u_sediment_height_max: regl.prop('u_sediment_height_max'),
        u_sediment_height_min: regl.prop('u_sediment_height_min'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4
});

const calculate_Q_boundary_conditions = regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/calculate-Q-boundary-conditions-2.frag'),
    attributes: {
        a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        a_uv: [[0, 0], [1, 0], [0, 1], [1, 1]]
    },
    uniforms: {
        u_Q: regl.prop('u_Q'),
        u_boundary: regl.prop('u_boundary'),
        u_upper_bank: regl.prop('u_upper_bank'),
        u_lower_bank: regl.prop('u_lower_bank'),
        u_bank_width: regl.prop('u_bank_width'),
        u_sediment_height_max: regl.prop('u_sediment_height_max'),
        u_sediment_height_min: regl.prop('u_sediment_height_min'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4
});


class Tile {
    constructor(terrain_url, boundary_url, testcase=false) {

        this.terrain_url = terrain_url;
        this.boundary_url = boundary_url
        this.is_testcase = testcase

        this.loaded = false;
        this.t = 0.0
    }

    async get_resources() {
        // NOTE(Nic): Factor this so that it just wants Float32Array of the right length?
        // NOTE(Nic): Pull out TILE_SIZE as a parameter to this module?
        
        let textures = await Promise.all([ 
            load_image(`/data/${this.terrain_url}`), 
            load_image(`/data/${this.boundary_url}`), 
        ]);

        this.elevation = regl.texture({ data: textures[0], mag: DEFAULT_INTERPOLATION, min: DEFAULT_INTERPOLATION });
        this.boundary = regl.texture({ data: textures[1], mag: DEFAULT_INTERPOLATION, min: DEFAULT_INTERPOLATION });

        const curvature_scale_factor = 1.0;
        // these buffers are aligned to the H grid
        this.H = new DoubleFramebuffer(regl, TILE_SIZE); // height map
        this.K = new DoubleFramebuffer(regl, [TILE_SIZE[0] / curvature_scale_factor, TILE_SIZE[1] / curvature_scale_factor]); // curvature buffer
        this.E = new DoubleFramebuffer(regl, [TILE_SIZE[0] / curvature_scale_factor, TILE_SIZE[1] / curvature_scale_factor]); // Edge Map
        this.S = new SingleFramebuffer(regl, TILE_SIZE); // slope buffer
        this.N = new SingleFramebuffer(regl, TILE_SIZE);

        // these buffers are aligned to the Q grid
        this.Q = new DoubleFramebuffer(regl, TILE_SIZE); // flux buffer

        if (this.is_testcase) {
            calculate_testcase_initial_conditions({
                target: this.H.front,
                u_elevation: this.elevation,
            })

        } else {
            calculate_initial_conditions({
                target: this.H.front,
    
                u_elevation: this.elevation,
                u_boundary: this.boundary,
    
                u_upper_bank: parameters.upper_bank,
                u_lower_bank: parameters.lower_bank,
                u_bank_width: parameters.bank_width,
                u_sediment_height_max: parameters.sediment_height_max,
                u_sediment_height_min: parameters.sediment_height_min,
            })
        }

        

        this.loaded = true
    }

    simulate (transform, resources, parameters) {
        if (parameters.running) { 
            console.log('step tiles');

            let s = performance.now()
            for (let i = 0; i < parameters.updates_per_frame; i++) {
                // update Q
                calculate_slope_field({
                    target: this.S.buffer,
                    u_H: this.H.front,
                })

                calculate_flow_field({
                    target: this.Q.back,
                    u_H: this.H.front,
                    u_S: this.S.buffer,
                })
                this.Q.swap();

                // single averaging step
                for (let i = 0; i < parameters.flux_averaging_steps; i++) {
                    calculate_flow_field_averaging({
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
                let render_iterations_per_smoothing = 50
                if (i % parameters.smoothing_iterations == 0 && resources.t % render_iterations_per_smoothing == 0) {
                    // update edges
                    calculate_edges({
                        target: this.E.back,
                        u_H: this.H.front,
                    })
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
                    calculate_curvature({
                        target: this.K.back,
                        u_H: this.H.front,
                        u_E: this.E.front,
                    })
                    this.K.swap();

                    // averaging passes.
                    
                    for (let i = 0; i < parameters.smoothing_iterations; i++) {
                        calculate_edge_averaging({
                            target: this.K.back,
                            u_K: this.K.front,
                            u_E: this.E.front,
                            u_H: this.H.front,
                        })
                        this.K.swap();
                    }

                
                    for (let j = 0; j < parameters.smoothing_iterations; j++) {
                        calculate_stream_averaging({
                            target: this.K.back,
                            u_K: this.K.front,
                            u_E: this.E.front,
                            u_H: this.H.front,
                        })
                        this.K.swap();
                    }
                }
                
                // calculate erosion and collapse.
                if (
                    parameters.run_erosion && 
                    resources.t > parameters.non_erosive_timesteps &&
                    i % parameters.water_updates_per_iteration == 0
                    ) {
                    calculate_erosion_accretion({
                        target: this.H.back,
                        u_Q: this.Q.front,
                        u_H: this.H.front,
                        u_K: this.K.front,
                        u_S: this.S.buffer,

                        u_k_erosion: parameters.erosion_speed,
                        u_k_accretion: parameters.accretion_speed,
                        u_Q_accretion_upper_bound: parameters.accretion_upper_bound,
                        u_Q_erosion_lower_bound: parameters.erosion_lower_bound,
                    })
                    this.H.swap();

                    calculate_collapse({
                        target: this.H.back,
                        u_Q: this.Q.front,
                        u_H: this.H.front,
                        u_K: this.K.front,
                        u_S: this.S.buffer,

                        u_k_erosion: parameters.erosion_speed,
                        u_k_accretion: parameters.accretion_speed,
                        u_Q_accretion_upper_bound: parameters.accretion_upper_bound,
                        u_Q_erosion_lower_bound: parameters.erosion_lower_bound,
                        u_min_failure_slope: parameters.min_failure_slope,
                    })
                    this.H.swap();
                }


                // update H
                advance_water_depth({
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

                calculate_Q_boundary_conditions({
                    target: this.Q.back,
                    u_Q: this.Q.front,
                    u_boundary: this.boundary,
                    u_upper_bank: parameters.upper_bank,
                    u_lower_bank: parameters.lower_bank,
                    u_bank_width: parameters.bank_width,
                    u_sediment_height_max: parameters.sediment_height_max,
                    u_sediment_height_min: parameters.sediment_height_min,
                })
                this.Q.swap();
            }
            let e = performance.now();
            let avg_update_time = (e - s) / parameters.updates_per_frame
            // console.log(`${resources.t} ${parameters.updates_per_frame} updates: ${e - s}ms (${avg_update_time.toFixed(3)}ms / step)`);
        }
    }

    render (transform, resources) {}

    destroy () {}
}

export { Tile };