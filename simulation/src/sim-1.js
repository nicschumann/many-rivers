import "./style/main.css";
import { vec2, vec3, mat3, mat4, vec4 } from "gl-matrix";
import { DoubleFramebuffer, SingleFramebuffer, DEFAULT_INTERPOLATION } from "./buffer";
import { DomainMesh } from "./mesh";
import parameters from './parameters';

const regl = require('regl')({
    extensions: [
        'OES_texture_float',
        'OES_texture_float_linear',
        'OES_element_index_uint',
        'OES_standard_derivatives',
        'EXT_shader_texture_lod'
    ]
});

const RENDER_3D = false;
const RENDER_SCALE = 2.0;
const TILE_SIZE = [384, 384];
const TERRAIN_SIZE = [TILE_SIZE[0] * RENDER_SCALE, TILE_SIZE[1] * RENDER_SCALE];

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
        a_uv: regl.prop('a_uv')
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
        a_uv: regl.prop('a_uv')
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
        a_uv: regl.prop('a_uv')
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
        a_uv: regl.prop('a_uv')
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
        a_uv: regl.prop('a_uv')
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
        a_uv: regl.prop('a_uv')
    },
    uniforms: {
        u_H: regl.prop('u_H'),
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
        a_uv: regl.prop('a_uv')
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
        a_uv: regl.prop('a_uv')
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
        a_uv: regl.prop('a_uv')
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

// surface normal calculation
const calculate_N_normals = regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/calculate-N-normals.frag'),
    attributes: {
        a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        a_uv: regl.prop('a_uv')
    },
    uniforms: {
        u_H: regl.prop('u_H'),
        u_resolution: TILE_SIZE,
    },
    primitive: "triangle strip",
    count: 4
});

// sediment stuff

const calculate_erosion_accretion = regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/calculate-H-erosion-accretion-5.frag'),
    attributes: {
        a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        a_uv: regl.prop('a_uv')
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
        a_uv: regl.prop('a_uv')
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
        a_uv: regl.prop('a_uv')
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
        a_uv: regl.prop('a_uv')
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
    frag: require('./shaders/calculate-Q-boundary-conditions.frag'),
    attributes: {
        a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        a_uv: regl.prop('a_uv')
    },
    uniforms: {
        u_Q: regl.prop('u_Q'),
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


// GPU calls: rendering
const render_tile_as_color = regl({
    vert: require('./shaders/place-tile.vert'),
    frag: require('./shaders/render-color.frag'),
    attributes: {
        a_position: regl.prop('a_position'),
        a_uv: regl.prop('a_uv')
    },
    uniforms: {
        u_transform: regl.prop('u_transform'),
        u_color: regl.prop('u_color'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4
});

const render_terrain_height = regl({
    vert: require('./shaders/place-tile.vert'),
    frag: require('./shaders/render-terrain-height.frag'),
    attributes: {
        a_position: regl.prop('a_position'),
        a_uv: regl.prop('a_uv')
    },
    uniforms: {
        u_transform: regl.prop('u_transform'),
        u_H: regl.prop('u_H'),
        u_scalefactor: regl.prop('u_scalefactor'),
        u_saturation_point: regl.prop('u_saturation_point'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4  
})

const render_flux = regl({
    vert: require('./shaders/place-tile.vert'),
    frag: require('./shaders/render-flux.frag'),
    attributes: {
        a_position: regl.prop('a_position'),
        a_uv: regl.prop('a_uv')
    },
    uniforms: {
        u_transform: regl.prop('u_transform'),
        u_Q: regl.prop('u_Q'),
        u_H: regl.prop('u_H'),
        u_scalefactor: regl.prop('u_scalefactor'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4  
})

const render_flux_magnitude = regl({
    vert: require('./shaders/place-tile.vert'),
    frag: require('./shaders/render-flux-magnitude.frag'),
    attributes: {
        a_position: regl.prop('a_position'),
        a_uv: regl.prop('a_uv')
    },
    uniforms: {
        u_transform: regl.prop('u_transform'),
        u_Q: regl.prop('u_Q'),
        u_H: regl.prop('u_H'),
        u_flux_magnitude_scale: regl.prop('u_flux_magnitude_scale'),
        u_scalefactor: regl.prop('u_scalefactor'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4  
})

const render_slope = regl({
    vert: require('./shaders/place-tile.vert'),
    frag: require('./shaders/render-slope.frag'),
    attributes: {
        a_position: regl.prop('a_position'),
        a_uv: regl.prop('a_uv')
    },
    uniforms: {
        u_transform: regl.prop('u_transform'),
        u_S: regl.prop('u_S'),
        u_H: regl.prop('u_H'),
        u_scalefactor: regl.prop('u_scalefactor'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4  
})

const render_curvature = regl({
    vert: require('./shaders/place-tile.vert'),
    frag: require('./shaders/render-curvature.frag'),
    attributes: {
        a_position: regl.prop('a_position'),
        a_uv: regl.prop('a_uv')
    },
    uniforms: {
        u_transform: regl.prop('u_transform'),
        u_H: regl.prop('u_H'),
        u_Q: regl.prop('u_Q'),
        u_K: regl.prop('u_K'),
        u_scalefactor: regl.prop('u_scalefactor'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4  
})

const render_erosion_accretion = regl({
    vert: require('./shaders/place-tile.vert'),
    frag: require('./shaders/render-erosion-accretion-values-2.frag'),
    attributes: { 
        a_position: regl.prop('a_position'),
        a_uv: regl.prop('a_uv')
    },
    uniforms: {
        u_transform: regl.prop('u_transform'),
        u_H: regl.prop('u_H'),
        u_Q: regl.prop('u_Q'),
        u_S: regl.prop('u_S'),
        u_K: regl.prop('u_K'),

        u_k_erosion: regl.prop('u_k_erosion'),
        u_k_accretion: regl.prop('u_k_accretion'),
        u_Q_accretion_upper_bound: regl.prop('u_Q_accretion_upper_bound'),
        u_Q_erosion_lower_bound: regl.prop('u_Q_erosion_lower_bound'),

        u_scalefactor: regl.prop('u_scalefactor'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4  
})

const render_section_line = regl({
    vert: require('./shaders/place-tile.vert'),
    frag: require('./shaders/render-section-line.frag'),
    attributes: {
        a_position: regl.prop('a_position'),
        a_uv: regl.prop('a_uv')
    },
    uniforms: {
        u_transform: regl.prop('u_transform'),
        u_p1: regl.prop('u_p1'),
        u_p2: regl.prop('u_p2'),
        u_color: regl.prop('u_color'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4 
});

const render_crosssection = regl({
    vert: require('./shaders/place-tile.vert'),
    frag: require('./shaders/render-point-crosssection.frag'),
    attributes: {
        a_position: regl.prop('a_position'),
        a_uv: regl.prop('a_uv')
    },
    uniforms: {
        u_transform: regl.prop('u_transform'),
        u_p1: regl.prop('u_p1'),
        u_p2: regl.prop('u_p2'),
        u_H: regl.prop('u_H'),
        u_color: regl.prop('u_color'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4 
});

// 3D RENDER CALLS
let DOMAIN_MESH = new DomainMesh(regl, [512, 512]);


const render_domain = regl({
    framebuffer: null,
    vert: require('./shaders/place-mesh.vert'),
    frag: require('./shaders/render-domain.frag'),
    attributes: {
        a_position: DOMAIN_MESH.vertices,
        a_uv: DOMAIN_MESH.uvs,
        a_id: DOMAIN_MESH.ids
    },
    elements: DOMAIN_MESH.indices,
    uniforms: {
        u_transform: regl.prop('u_transform'),
        u_basepoint: regl.prop('u_basepoint'),
        u_resolution: DOMAIN_MESH.cells,

        u_H: regl.prop('u_H'),
        u_N: regl.prop('u_N')
    },
    primitive: 'triangles',
    offset: 0,
    count: DOMAIN_MESH.indices.length * 3.0
});

const render_river = regl({
    framebuffer: null,
    vert: require('./shaders/place-river.vert'),
    frag: require('./shaders/render-river.frag'),
    attributes: {
        a_position: DOMAIN_MESH.vertices,
        a_uv: DOMAIN_MESH.uvs,
        a_id: DOMAIN_MESH.ids
    },
    elements: DOMAIN_MESH.indices,
    uniforms: {
        u_transform: regl.prop('u_transform'),
        u_basepoint: regl.prop('u_basepoint'),
        u_resolution: DOMAIN_MESH.cells,
        u_tex_resolution: TILE_SIZE,

        u_H: regl.prop('u_H'),
        u_N: regl.prop('u_N'),
        u_view_pos: regl.prop('u_view_pos')
    },
    primitive: 'triangles',
    offset: 0,
    depth: { func: 'lequal' },
    blend: {
        enable: true,
        func: {src: 'src alpha', dst: 'one minus src alpha'}
    },
    count: DOMAIN_MESH.indices.length * 3.0
});

// const render_point = regl({
//     framebuffer: null,
//     vert: require('./shaders/place-point.vert'),
//     frag: require('./shaders/render-point.frag'),
//     attributes: {
//         a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
//     },
//     elements: DOMAIN_MESH.indices,
//     uniforms: {
//         u_transform: regl.prop('u_transform'),
//         u_basepoint: regl.prop('u_basepoint'),
//         u_H: regl.prop('u_H'),
//     },
//     primitive: 'triangle strip',
//     offset: 0,
//     count: 4
// })

// CPU Datastructures



class Tile {
    constructor(x, y, z, testcase=false) {
        console.log(x, y, z);

        this.x = x;
        this.y = y;
        this.z = z;
        this.is_testcase = testcase

        this.positions = [
            [x, y], [x + 1, y],
            [x, y + 1], [x + 1, y + 1]
        ]

        this.uvs = [
            [0, 0], [1, 0],
            [0, 1], [1, 1]
        ]

        this.loading_color = [0/255, 74/255, 74/255]; // just a fun baseline
        this.loaded = false;
        this.t = 0.0
    }

    async get_resources() {
        // console.log(DOMAIN_MESH);

        const terrain_url = `/data/${this.z}-${this.x}-${this.y}-terrain.png`;
        const boundary_url = (this.is_testcase)
            ? `/data/${this.z}-${this.x}-${this.y}-terrain.png`
            : `/data/${this.z}-${this.x}-${this.y}-boundary-all.png`;

        let textures = await Promise.all([ 
            load_image(terrain_url), 
            load_image(boundary_url), 
        ]);

        this.elevation = regl.texture({ data: textures[0], mag: DEFAULT_INTERPOLATION, min: DEFAULT_INTERPOLATION });
        this.boundary = regl.texture({ data: textures[1], mag: DEFAULT_INTERPOLATION, min: DEFAULT_INTERPOLATION });

        // these buffers are aligned to the H grid
        this.H = new DoubleFramebuffer(regl, TILE_SIZE); // height map
        this.K = new DoubleFramebuffer(regl, TILE_SIZE); // curvature buffer
        this.E = new SingleFramebuffer(regl, TILE_SIZE); // Edge Map
        this.S = new SingleFramebuffer(regl, TILE_SIZE); // slope buffer
        this.N = new SingleFramebuffer(regl, TILE_SIZE);

        // these buffers are aligned to the Q grid
        this.Q = new DoubleFramebuffer(regl, TILE_SIZE); // flux buffer

        if (this.is_testcase) {
            calculate_testcase_initial_conditions({
                target: this.H.front,
                a_uv: this.uvs,    
                u_elevation: this.elevation,
            })

        } else {
            calculate_initial_conditions({
                target: this.H.front,
                a_uv: this.uvs,
    
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

    render (transform, resources) {
        if (this.loaded) {
            if (parameters.running) { 
                console.log('step tiles');

                let s = performance.now()
                for (let i = 0; i < parameters.updates_per_frame; i++) {
                    // update Q
                    calculate_slope_field({
                        target: this.S.buffer,
                        u_H: this.H.front,
                        a_uv: this.uvs
                    })

                    calculate_flow_field({
                        target: this.Q.back,
                        u_H: this.H.front,
                        u_S: this.S.buffer,
                        a_uv: this.uvs
                    })
                    this.Q.swap();

                    // single averaging step
                    for (let i = 0; i < parameters.flux_averaging_steps; i++) {
                        calculate_flow_field_averaging({
                            target: this.Q.back,
                            u_Q: this.Q.front,
                            a_uv: this.uvs 
                        });
                        this.Q.swap();
                    }
                    

                    // this averaging system is appropriate with 
                    // stream-averaging-2, which iteratively solved 
                    // a laplace equation across the river domain.
                    if (i % parameters.smoothing_iterations == 0) {
                        // update edges
                        calculate_edges({
                            target: this.E.buffer,
                            u_H: this.H.front,
                            a_uv: this.uvs
                        })

                        // update Kappa
                        calculate_curvature({
                            target: this.K.back,
                            u_H: this.H.front,
                            u_E: this.E.buffer,
                            a_uv: this.uvs
                        })
                        this.K.swap();

                        // averaging passes.
                        
                        for (let i = 0; i < parameters.smoothing_iterations; i++) {
                            calculate_edge_averaging({
                                target: this.K.back,
                                u_K: this.K.front,
                                u_E: this.E.buffer,
                                u_H: this.H.front,
                                a_uv: this.uvs
                            })
                            this.K.swap();
                        }

                    
                        for (let j = 0; j < parameters.smoothing_iterations; j++) {
                            calculate_stream_averaging({
                                target: this.K.back,
                                u_K: this.K.front,
                                u_E: this.E.buffer,
                                u_H: this.H.front,
                                a_uv: this.uvs
                            })
                            this.K.swap();
                        }
                    }
                    
                    // calculate erosion and collapse.
                    if (parameters.run_erosion && resources.t > parameters.non_erosive_timesteps) {
                        calculate_erosion_accretion({
                            target: this.H.back,
                            u_Q: this.Q.front,
                            u_H: this.H.front,
                            u_K: this.K.front,
                            u_S: this.S.buffer,

                            u_k_erosion: parameters.k_erosion,
                            u_k_accretion: parameters.k_accretion,
                            u_Q_accretion_upper_bound: parameters.accretion_upper_bound,
                            u_Q_erosion_lower_bound: parameters.erosion_lower_bound,
                            a_uv: this.uvs,
                        })
                        this.H.swap();

                        calculate_collapse({
                            target: this.H.back,
                            u_Q: this.Q.front,
                            u_H: this.H.front,
                            u_K: this.K.front,
                            u_S: this.S.buffer,

                            u_k_erosion: parameters.k_erosion,
                            u_k_accretion: parameters.k_accretion,
                            u_Q_accretion_upper_bound: parameters.accretion_upper_bound,
                            u_Q_erosion_lower_bound: parameters.erosion_lower_bound,
                            u_min_failure_slope: parameters.min_failure_slope,
                            a_uv: this.uvs,
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
                        a_uv: this.uvs,
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
                        u_upper_bank: parameters.upper_bank,
                        u_lower_bank: parameters.lower_bank,
                        u_bank_width: parameters.bank_width,
                        u_sediment_height_max: parameters.sediment_height_max,
                        u_sediment_height_min: parameters.sediment_height_min,
                        a_uv: this.uvs,
                    })
                    this.Q.swap();
                }
                let e = performance.now();
                let avg_update_time = (e - s) / parameters.updates_per_frame
                // console.log(`${resources.t} ${parameters.updates_per_frame} updates: ${e - s}ms (${avg_update_time.toFixed(3)}ms / step)`);
            }

            
            // 3D RENDERING STEPS
            if (RENDER_3D) {

                // console.log('render');
                regl.clear({depth: 1.0});

                let camera = resources.camera;
                // console.log(camera);

                const target = camera.target;
                const camera_position = camera.position;

                const front = vec3.subtract([], target, camera_position);
                const right = vec3.cross([], front, [0.0, -1.0, 0.0]);
                const up = vec3.cross([], front, right);

                const V = mat4.lookAt([], camera_position, target, up);
                const P = mat4.perspective([], Math.PI / 4.0, window.innerWidth / window.innerHeight, 0.001, 100.0);

                const PV = mat4.multiply([], P, V);

                calculate_N_normals({
                    target: this.N.buffer,
                    a_uv: this.uvs,
                    u_H: this.H.front,
                });

                render_domain({
                    u_basepoint: [this.x, 0.0, this.y],
                    u_transform: PV,

                    u_H: this.H.front,
                    u_N: this.N.buffer
                });

                render_river({
                    u_basepoint: [this.x, 0.0, this.y],
                    u_transform: PV,

                    u_H: this.H.front,
                    u_N: this.N.buffer,
                    u_view_pos: camera_position
                });

                // render_point({
                //     u_basepoint: [this.x, 0.0, this.y]
                // })

            } else {
                // 2D RENDERING STEPS:

                regl.clear({depth: 1.0});
                render_terrain_height({
                    u_H: this.H.front,
                    u_scalefactor: 0.5,
                    u_saturation_point: parameters.saturation_point,

                    a_position: this.positions,
                    a_uv: this.uvs,
                    u_transform: transform,
                });

                if (parameters.render_flux)
                {
                    regl.clear({depth: 1.0});
                    render_flux({
                        u_Q: this.Q.front,
                        u_H: this.H.front,
                        u_scalefactor: 0.5,
        
                        a_position: this.positions,
                        a_uv: this.uvs,
                        u_transform: transform,
                    })
                }

                if (parameters.render_flux_magnitude)
                {
                    regl.clear({depth: 1.0});
                    render_flux_magnitude({
                        u_Q: this.Q.front,
                        u_H: this.H.front,
                        u_scalefactor: 0.5,
                        u_flux_magnitude_scale: parameters.flux_magnitude_scale,
        
                        a_position: this.positions,
                        a_uv: this.uvs,
                        u_transform: transform,
                    })
                }

                if (parameters.render_slope)
                {
                    regl.clear({depth: 1.0});
                    render_slope({
                        u_S: this.S.buffer,
                        u_K: this.K.front,
                        u_scalefactor: 4.0,
        
                        a_position: this.positions,
                        a_uv: this.uvs,
                        u_transform: transform,
                    })
                }
                
                if (parameters.render_curvature)
                {
                    regl.clear({depth: 1.0});
                    render_curvature({
                        u_H: this.H.front,
                        u_K: this.K.front,
                        u_scalefactor: 4.0,
        
                        a_position: this.positions,
                        a_uv: this.uvs,
                        u_transform: transform,
                    })
                }

                if (parameters.render_erosion_accretion)
                {
                    regl.clear({depth: 1.0});
                    render_erosion_accretion({
                        u_H: this.H.front,
                        u_K: this.K.front,
                        u_Q: this.Q.front,
                        u_S: this.S.buffer,

                        u_k_erosion: parameters.k_erosion,
                        u_k_accretion: parameters.k_accretion,
                        u_Q_accretion_upper_bound: parameters.accretion_upper_bound,
                        u_Q_erosion_lower_bound: parameters.erosion_lower_bound,
                        
                        u_scalefactor: 4.0,
        
                        a_position: this.positions,
                        a_uv: this.uvs,
                        u_transform: transform,
                    })
                } 

                regl.clear({depth: 1.0});
                render_section_line({
                    u_p1: parameters.p1,
                    u_p2: parameters.p2,
                    u_color: [0.65, 0.2, 0.0],
                    a_position: this.positions,
                    a_uv: this.uvs,
                    u_transform: transform,
                })

            }

        } else {
            console.log('still loading!');
            // If we're still waiting for textures...
            render_tile_as_color({
                a_position: this.positions,
                a_uv: this.uvs,
                u_transform: transform,
                u_color: this.loading_color
            });

        }        
    }

    destroy () {
    }
}


// CrossSection

class CrossSection {
    constructor(testcase=False) {
        this.is_testcase = testcase

        this.positions = [
            [this.x, this.y], [this.x + 1, this.y],
            [this.x, this.y + 1], [this.x + 1, this.y + 1]
        ]

        this.uvs = [
            [0, 0], [1, 0],
            [0, 1], [1, 1]
        ]

        this.parent = null
        this.loaded = false
    }

    get_resources() {
    }

    update_positions () {
        this.positions = [
            [this.x, this.y], [this.x + 1, this.y],
            [this.x, this.y + 1], [this.x + 1, this.y + 1]
        ]
    }

    set_parent(parent) {
        this.parent = parent;
        this.x = parent.x + 1.0;
        this.y = parent.y + 0.0;
        this.z = parent.z;
        this.update_positions();
    }

    render(transform, resources) {
        if (this.parent == null || !this.parent.loaded) { return; }
        if (RENDER_3D) { return; }

        regl.clear({depth: 1.0});
        render_crosssection({
            u_p1: parameters.p1,
            u_p2: parameters.p2,
            u_H: this.parent.H.front,

            a_position: this.positions,
            a_uv: this.uvs,
            u_transform: transform,
            u_color: this.loading_color
        });

    }
}

// TileProvider
class Camera {
    constructor (position, target) {
        this.position = position;
        this.target = target;
    }

    get_matrix () {

    }
}

class TileProvider {
    constructor () {

        // specify the map you want...
        this.tiles = [
            // new Tile(1878, 3483, 13), // matamoros/brownsville data
            // new Tile(0, 1, 13, true), // TC 1 dead end
            // new Tile(0, 3, 13, true), // TC 3 simple sine
            // new Tile(0, 6, 13, true), // TC 3 flipped simple sine
            // new Tile(0, 2, 13, true), // TC 2 short circuit
            // new Tile(0, 4, 13, true), // TC 4 narrowing path
            // new Tile(0, 5, 13, true), // TC 5 lake
            // new Tile(0, 7, 13, true), // TC 7 Parabola

            // Real DEM Stuff
            new Tile(0, 0, 14),

            new CrossSection(true)
        ];

        // hook up the cross section renderer
        this.tiles[1].set_parent( this.tiles[0] );

        this.tile_map = {};
        this.resources = { 
            t: 0.0,
            camera: new Camera(
                [this.tiles[0].x + 0.85, 0.25, this.tiles[0].y + 0.85],
                [this.tiles[0].x + 0.5, 0.0, this.tiles[0].y + 0.5]
            )
        };

        // this.tile_center = [ 1878.5, 3483.5 ]
        this.tile_center = [ this.tiles[0].x + 1.0, this.tiles[0].y + 0.5]

        this.setup_transform();
        this.tiles.forEach(t => t.get_resources() );
    }

    setup_transform() {
        let viewport = [window.innerWidth, window.innerHeight];

        let scalefactors = [
            2 * TERRAIN_SIZE[0] / viewport[0],
            -2 * TERRAIN_SIZE[1] / viewport[1],
        ]

        let T_trans = mat3.fromTranslation([], [
            -this.tile_center[0],
            -this.tile_center[1]
        ])

        let T_scale = mat3.fromScaling([], scalefactors);
        
        this.transform = mat3.multiply([], T_scale, T_trans);
    }

    render_tiles () {
        let s = performance.now();

        // regl.clear({color: [0, 0, 0, 1]});
        this.tiles.forEach((tile, i) => { tile.render(this.transform, this.resources); });
        this.resources.t += (parameters.running) ? 1 : 0;

        let e = performance.now();
        // console.log(`total render: ${e - s}ms`);
    }

    update_center ([d_x, d_y]) {
        this.tile_center[0] += d_x;
        this.tile_center[1] += d_y;
    }

    // update_tiles () {        
    //     this.tile_map = reset_tile_view_state(this.tile_map); // set everything to out of view;

    //     let viewport_margin = 1.0;
    //     let viewport = [
    //         viewport_margin * window.innerWidth, 
    //         viewport_margin * window.innerHeight
    //     ];

    //     let current_gids = [
    //         Math.floor(this.tile_center[0]), 
    //         Math.floor(this.tile_center[1])
    //     ];

    //     let current_px = [
    //         viewport[0] / 2 - ((this.tile_center[0] % 1) * TILE_SIZE[0]),
    //         viewport[1] / 2 - ((this.tile_center[1] % 1) * TILE_SIZE[1])
    //     ];

    //     populate_tiles_in_viewport(
    //         this.tiles,
    //         this.tile_map, 

    //         current_px, 
    //         current_gids, 
    //         viewport, 

    //         [-1, -1],
    //         this.map_zoom
    //     );

    //     current_gids[0] += 1;
    //     current_px[0] += TILE_SIZE[0];

    //     populate_tiles_in_viewport(
    //         this.tiles, 
    //         this.tile_map,

    //         current_px, 
    //         current_gids, 
    //         viewport, 

    //         [1, 1],
    //         this.map_zoom
    //     );

    //     this.tiles = remove_unneeded_tiles(this.tiles, this.tile_map);
    //     console.log(`tile count: ${this.tiles.length}`);
    // }

    // update_center ([d_lng, d_lat]) {
    //     this.map_center[0] += d_lng;
    //     this.map_center[1] += d_lat;

    //     this.tile_center = [
    //         lng_to_tile(this.map_center[0], this.map_zoom),
    //         lat_to_tile(this.map_center[1], this.map_zoom),
    //     ]
    // }
}


// NOTE(Nic): this stuff might all be unneccesary, because we're not 
// paging stuff in infintely at all... Keeping it here, but will revisit.

// const make_tile_key = (z, lng, lat) => `${z}-${lng}-${lat}`;
// const in_tile_map = (key, tile_map) => typeof tile_map[key] !== 'undefined';


// const reset_tile_view_state = (tile_map) =>{
//     Object.keys(tile_map).forEach(key => {
//         tile_map[key].in_view = false;
//     });

//     return tile_map;
// }

// const remove_unneeded_tiles = (tiles, tile_map) => {
//     tiles = tiles.filter(tile => {
//         key = make_tile_key(tile.z, tile.tlng, tile.tlat);
//         if (!tile_map[key].in_view) {
            
//             /**
//              * We should really reuse the tiles in memory, rather than
//              * continuing to fragment the heap. This requires a better allocation
//              * strategy, though. Look into this!
//              */

//             // tile_map[key].destroy(); // actually destroying the resources takes a long time, not good.
//             delete tile_map[key];
//             return false;

//         } else {

//             return true;
            
//         }
//     })

//     return tiles;
// }

// // this adds fresh tiles to the map
// // around the centerpoint.
// const populate_tiles_in_viewport = (
//         tiles, 
//         tile_map,
//         [current_x_px, current_y_px], 
//         [current_tlng, current_tlat], 
//         [width_px, height_px], 
//         [dx, dy],
//         z
//     ) => {

//         while (
//             current_x_px + TILE_SIZE[0] > 0 &&
//             current_y_px + TILE_SIZE[1] > 0 &&
//             current_x_px < width_px &&
//             current_y_px < height_px
//         ) {
//             // if our y dir is increasing, we want to add
//             // the tiles to the end of our list.
//             let key = make_tile_key(z, current_tlng, current_tlat);
//             if (!in_tile_map(key, tile_map)) {
//                 let tile = new Tile(current_tlng, current_tlat, z);
//                 tile.get_resources();
//                 tile_map[key] = {in_view: true};
//                 tiles.push(tile);
//             } else {
//                 tile_map[key].in_view = true;
//             }

//             current_x_px += dx * TILE_SIZE[0];
//             current_tlng += dx

//             if (current_x_px + TILE_SIZE[0] < 0 || current_x_px > width_px) { 
//                 // step up a row
//                 current_y_px += dy * TILE_SIZE[1]; 
//                 current_tlat += dy;
                
//                 // replace the overshot tile.
//                 dx *= -1;
//                 current_x_px += dx * TILE_SIZE[0]
//                 current_tlng += dx;

//                 // console.log('row', [current_x_px, current_y_px]);
//             }
//         }
// };




function setup_controls() 
{
    let toggle = document.getElementById('control-toggle');
    let container = document.getElementById('control-container');

    toggle.addEventListener('click', e => {
        toggle.classList.toggle('active');
        container.classList.toggle('active');
    })

    Object.keys(parameters).forEach(key => {
        let input_container = document.createElement('div');
        input_container.classList.add('parameter-container');
        
        title_span = document.createElement('span');
        title_span.classList.add('parameter-title');
        title_span.innerText = key;

        input_element = document.createElement('input');
        input_element.classList.add('parameter-input');
        input_element.id = key;

        if (typeof parameters[key] == 'boolean') {
            input_element.type = 'checkbox';
            input_element.checked = parameters[key];
            input_element.addEventListener('change', e => {
                console.log(e.target.checked);
                parameters[key] = e.target.checked;
            })

        } else if (typeof parameters[key] == 'number') {
            input_element.type = 'number';
            input_element.value = parameters[key];
            input_element.min = 0.01;
            input_element.step = 0.01;
            input_element.addEventListener('change', e => {
                parameters[key] = Number(e.target.value);
            })

        } else {
            input_element.type = 'text';
            input_element.value = parameters[key];
            input_element.addEventListener('change', e => {
                parameters[key] = e.target.value;
            })

        }

        // NOTE(Nic): Only show for boolean inputs.
        // if (typeof parameters[key] == 'boolean') {
            input_container.appendChild(title_span);
            input_container.appendChild(input_element);
            container.appendChild(input_container);
        // }
    })
}


function setup_resize() {
    
}

async function main () {
    let provider = new TileProvider();
    let counter_icon = document.getElementById('timestep-container');

    // game loop
    // TODO(Nic): replace with requestAnimationFrame
    // TODO(Nic): replace with manual canvas and resize canvas appropriately.
    
    let i = 0;
    setInterval(() => {
        // TODO(Nic): Add window resize handler here, please...

        regl.clear({color: [0, 0, 0, 1]});
        provider.setup_transform();
        provider.render_tiles();

        if (parameters.running) { 
            counter_icon.innerText = 
                `${i} (${i * parameters.updates_per_frame}) [${(i / 60).toFixed(2)}s]`;
            i += 1
        }
        
    }, 1000 / 30);

    // handle drag events.
    // internal state for the drag events...
    let mouse_is_down = false;
    let last_coords = [0, 0];
    let current_p_update = 0;
    let shift_key_is_down = false;

    window.addEventListener('resize', () => {
        let canvas = document.getElementsByTagName('canvas');
        if (canvas.length != 1) { console.error('unexpected <canvas> elements picked up in resize!'); } 
        
        regl._gl.canvas.width = window.innerWidth * 2.0;
        regl._gl.canvas.height = window.innerHeight * 2.0;

        provider.setup_transform();
    });

    window.addEventListener('mousedown', e => {
        mouse_is_down = true
        last_coords = [e.clientX, e.clientY];
    })

    window.addEventListener('mousemove', e => {
        
        if (mouse_is_down && !shift_key_is_down) {

            let [dx, dy] = [e.clientX - last_coords[0], e.clientY - last_coords[1]];
            last_coords = [e.clientX, e.clientY];

            provider.update_center([
                -dx / window.innerWidth * 2.0, 
                -dy / window.innerHeight * 2.0
            ]);

            // NOTE(Nic): turned off tile updating to debug shadow shading.
            // provider.update_tiles();
        } else if (mouse_is_down && shift_key_is_down) {

            let tile = provider.tiles[0] // anchor tile for now
            // NOTE(Nic): we don't need to invert this every click...
            let T_inv = mat3.invert([], provider.transform);

            let pos_s = [2.0 * e.clientX/window.innerWidth - 1, 2.0 * (1.0 - e.clientY/window.innerHeight) - 1.0]
            let pos_c = vec2.transformMat3([], pos_s, T_inv);
            
            if (
                pos_c[0] >= tile.x && pos_c[0] < tile.x + 1 &&
                pos_c[1] >= tile.y && pos_c[1] < tile.y + 1
            ) {
                
                let get_slope_intercept = (p1, p2) => {
                    let m = (p2[1] - p1[1]) / (p2[0] - p1[0]);
                    let b = -p1[0] * m + p1[1];

                    return [m, b];
                }

                let get_boundary_points = (m, b) => {
                    let p_min = [0, b];
                    let p_max = [1, m + b];

                    if (p_min[1] < 0) {
                        p_min = [-b/m, 0.0];
                    } else if (p_min[1] > 1) {
                        p_min = [(1.0 - b)/m, 1.0];
                    }

                    if (p_max[1] < 0) {
                        p_max = [-b/m, 0.0];
                    } else if (p_max[1] > 1) {
                        p_max = [(1.0 - b)/m, 1.0];
                    }

                    return [p_min, p_max];
                }

                let new_p = [pos_c[0] - tile.x, pos_c[1] - tile.y]
                
                if (current_p_update == 0) {
                    parameters.p1 = new_p;
                } else {
                    parameters.p2 = new_p;
                }

                let [m, b] = get_slope_intercept(parameters.p1, parameters.p2);
                let [p_min, p_max] = get_boundary_points(m, b);
                
                let p1_inp = document.getElementById('p1');
                let p2_inp = document.getElementById('p2');

                p1_inp.value = p_min.map(v => v.toFixed(3));
                p2_inp.value = p_max.map(v => v.toFixed(3));

            }
        }
        
    });

    window.addEventListener('mouseup', () => {
        mouse_is_down = false
        
        if (shift_key_is_down) { 
            current_p_update = (current_p_update + 1) % 2; 
        }
    })

    window.addEventListener('keydown', e => {
        console.log(e.key)


            if (e.key == 'Shift') {
                shift_key_is_down = true;
            }
    
            if (e.key == ' ') {
                parameters.running = !parameters.running;
                document.getElementById('running').checked = parameters.running;
            }
    
            if (e.key == 'f') {
                parameters.render_flux = !parameters.render_flux;
                parameters.render_slope = false;
                parameters.render_flux_magnitude = false;
                document.getElementById('render_flux').checked = parameters.render_flux;
                parameters.render_curvature = false;
                parameters.render_erosion_accretion = false;
            }
    
            if (e.key == 'm') {
                parameters.render_flux_magnitude = !parameters.render_flux_magnitude;
                parameters.render_flux = false;
                parameters.render_slope = false;
                document.getElementById('render_flux').checked = parameters.render_flux;
                parameters.render_curvature = false;
                parameters.render_erosion_accretion = false;
            }
    
            if (e.key == 'c') {
                parameters.render_flux = false;
                parameters.render_flux_magnitude = false;
                parameters.render_slope = false;
                parameters.render_curvature = !parameters.render_curvature;
                document.getElementById('render_curvature').checked = parameters.render_curvature;
                parameters.render_erosion_accretion = false;
            }
    
            if (e.key == 'e') {
                parameters.render_flux = false;
                parameters.render_flux_magnitude = false;
                parameters.render_slope = false;
                parameters.render_curvature = false;
                parameters.render_erosion_accretion = !parameters.render_erosion_accretion;
                document.getElementById('render_erosion_accretion').checked = parameters.render_erosion_accretion;
            }
    
            if (e.key == 's') {
                parameters.render_flux = false;
                parameters.render_flux_magnitude = false;
                parameters.render_curvature = false;
                parameters.render_slope = !parameters.render_slope;
                parameters.render_erosion_accretion = false;
                document.getElementById('render_slope').checked = parameters.render_slope;
            }
    
            if (e.key == 'ArrowRight') {
                regl.clear({color: [0, 0, 0, 1]});
                let running = parameters.running;
                parameters.running = true;
                provider.setup_transform();
                provider.render_tiles();
                parameters.running = running;
            }
        
    })

    window.addEventListener('keyup', e => {
        if (e.key == 'Shift') {
            shift_key_is_down = false;
            current_p_update = 0;
        }
    })
}

setup_controls()
main();
setup_resize();