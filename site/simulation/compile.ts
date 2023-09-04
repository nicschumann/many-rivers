// @ts-nocheck

import type { Regl, DrawCommand } from 'regl'

import { DomainMesh } from './mesh'
import { TILE_SIZE, TERRAIN_SIZE } from './constants'

export interface CompiledDrawCalls {
    calculate_initial_conditions: DrawCommand
    calculate_testcase_initial_conditions: DrawCommand
    calculate_slope_field: DrawCommand
    calculate_flow_field: DrawCommand
    calculate_flow_field_averaging: DrawCommand
    calculate_edges: DrawCommand
    calculate_edge_normalization_pass_one: DrawCommand
    calculate_edge_normalization_pass_two: DrawCommand
    calculate_curvature: DrawCommand
    calculate_edge_averaging: DrawCommand
    calculate_stream_averaging: DrawCommand
    calculate_erosion_accretion: DrawCommand
    calculate_collapse: DrawCommand
    advance_water_depth: DrawCommand
    calculate_H_boundary_conditions: DrawCommand
    calculate_Q_boundary_conditions: DrawCommand

    
    calculate_N_normals: DrawCommand

    render_terrain_height: DrawCommand
    render_flux: DrawCommand
    render_erosion_accretion: DrawCommand
    render_flux_magnitude: DrawCommand
    render_slope: DrawCommand
    render_curvature: DrawCommand
    render_section_line: DrawCommand
    render_tile_as_color: DrawCommand
    render_crosssection: DrawCommand
    render_domain: DrawCommand
    render_river: DrawCommand
    render_river_depth: DrawCommand
    render_river_flux: DrawCommand
    render_river_curvature: DrawCommand
    render_river_erosion_accretion: DrawCommand
}

export function compile_shaders(regl: Regl): CompiledDrawCalls {

    let DOMAIN_MESH = new DomainMesh(regl, TERRAIN_SIZE);
    let DOMAIN_OVERLAY_MESH = new DomainMesh(regl, [256, 256]);

    const v_passthrough = require('./shaders/pass-through.vert').default

    // GPU calls: initial conditions calculation
    const calculate_initial_conditions = regl({
        framebuffer: regl.prop('target'),
        vert: v_passthrough,
        frag: require('./shaders/calculate-H-initial-conditions-with-elevation.frag').default,
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
        vert: v_passthrough,
        frag: require('./shaders/calculate-H-initial-conditions-testcase.frag').default,
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
        vert: v_passthrough,
        frag: require('./shaders/calculate-S-field.frag').default,
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
        vert: v_passthrough,
        frag: require('./shaders/calculate-Q-field.frag').default,
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
        vert: v_passthrough,
        frag: require('./shaders/calculate-Q-averaging.frag').default,
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
        vert: v_passthrough,
        frag: require('./shaders/calculate-K-edge-field.frag').default,
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
        vert: v_passthrough,
        frag: require('./shaders/calculate-K-edge-normalization-1.frag').default,
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
        vert: v_passthrough,
        frag: require('./shaders/calculate-K-edge-normalization-2.frag').default,
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
        vert: v_passthrough,
        frag: require('./shaders/calculate-K-curvature-field.frag').default,
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
        vert: v_passthrough,
        frag: require('./shaders/calculate-K-edge-averaging.frag').default,
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
        vert: v_passthrough,
        frag: require('./shaders/calculate-K-stream-averaging-2.frag').default,
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
        vert: v_passthrough,
        frag: require('./shaders/calculate-H-erosion-accretion-5.frag').default,
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
        vert: v_passthrough,
        frag: require('./shaders/calculate-H-collapse-2.frag').default,
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
        vert: v_passthrough,
        frag: require('./shaders/calculate-H-depth-update.frag').default,
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
        vert: v_passthrough,
        frag: require('./shaders/calculate-H-boundary-conditions-with-elevation.frag').default,
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
        vert: v_passthrough,
        frag: require('./shaders/calculate-Q-boundary-conditions-2.frag').default,
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

    const calculate_N_normals = regl({
        framebuffer: regl.prop('target'),
        vert: v_passthrough,
        frag: require('./shaders/calculate-N-normals.frag').default,
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


    const render_tile_as_color = regl({
        vert: require('./shaders/place-tile.vert').default,
        frag: require('./shaders/render-color.frag').default,
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
        vert: require('./shaders/place-tile.vert').default,
        frag: require('./shaders/render-terrain-height.frag').default,
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
        vert: require('./shaders/place-tile.vert').default,
        frag: require('./shaders/render-flux.frag').default,
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
        vert: require('./shaders/place-tile.vert').default,
        frag: require('./shaders/render-flux-magnitude.frag').default,
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
        vert: require('./shaders/place-tile.vert').default,
        frag: require('./shaders/render-slope.frag').default,
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
        vert: require('./shaders/place-tile.vert').default,
        frag: require('./shaders/render-curvature.frag').default,
        attributes: {
            a_position: regl.prop('a_position'),
            a_uv: regl.prop('a_uv')
        },
        uniforms: {
            u_transform: regl.prop('u_transform'),
            u_H: regl.prop('u_H'),
            u_Q: regl.prop('u_Q'),
            u_K: regl.prop('u_K'),
            u_E: regl.prop('u_E'),
            u_scalefactor: regl.prop('u_scalefactor'),
            u_resolution: TILE_SIZE
        },
        primitive: "triangle strip",
        count: 4  
    })
    
    const render_erosion_accretion = regl({
        vert: require('./shaders/place-tile.vert').default,
        frag: require('./shaders/render-erosion-accretion-values-2.frag').default,
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
        vert: require('./shaders/place-tile.vert').default,
        frag: require('./shaders/render-section-line.frag').default,
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
        vert: require('./shaders/place-tile.vert').default,
        frag: require('./shaders/render-point-crosssection.frag').default,
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
            u_normalization_factor: regl.prop('u_normalization_factor'),
            u_resolution: TILE_SIZE,
        },
        primitive: "triangle strip",
        count: 4 
    });

    const render_domain = regl({
        framebuffer: null,
        vert: require('./shaders/place-mesh.vert').default,
        frag: require('./shaders/render-domain.frag').default,
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
            u_N: regl.prop('u_N'),
            u_color_contrast: regl.prop('u_color_contrast'),
            u_color_normalization: regl.prop('u_color_normalization')
        },
        primitive: 'triangles',
        offset: 0,
        count: DOMAIN_MESH.indices.length * 3.0
    });
    
    
    const render_river = regl({
        framebuffer: null,
        vert: require('./shaders/place-river.vert').default,
        frag: require('./shaders/render-river.frag').default,
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
            u_view_pos: regl.prop('u_view_pos'),
            u_y_offset: regl.prop('u_y_offset')
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

    const render_river_depth = regl({
        framebuffer: null,
        vert: require('./shaders/place-river.vert').default,
        frag: require('./shaders/render-river-overlay.frag').default,
        attributes: {
            a_position: DOMAIN_OVERLAY_MESH.vertices,
            a_uv: DOMAIN_OVERLAY_MESH.uvs,
            a_id: DOMAIN_OVERLAY_MESH.ids
        },
        elements: DOMAIN_OVERLAY_MESH.indices,
        uniforms: {
            u_transform: regl.prop('u_transform'),
            u_basepoint: regl.prop('u_basepoint'),
            u_resolution: DOMAIN_OVERLAY_MESH.cells,
            u_tex_resolution: TILE_SIZE,
    
            u_H: regl.prop('u_H'),
            u_N: regl.prop('u_N'),
            u_Q: regl.prop('u_Q'),
            u_view_pos: regl.prop('u_view_pos'),
            u_saturation_point: regl.prop('u_saturation_point'),
            u_y_offset: regl.prop('u_y_offset')
        },
        primitive: 'triangles',
        offset: 0,
        depth: { func: 'lequal' },
        blend: {
            enable: true,
            func: {src: 'src alpha', dst: 'one minus src alpha'}
        },
        count: DOMAIN_OVERLAY_MESH.indices.length * 3.0
    });

    const render_river_flux = regl({
        framebuffer: null,
        vert: require('./shaders/place-river.vert').default,
        frag: require('./shaders/render-flux.frag').default,
        attributes: {
            a_position: DOMAIN_OVERLAY_MESH.vertices,
            a_uv: DOMAIN_OVERLAY_MESH.uvs,
            a_id: DOMAIN_OVERLAY_MESH.ids
        },
        elements: DOMAIN_OVERLAY_MESH.indices,
        uniforms: {
            u_transform: regl.prop('u_transform'),
            u_basepoint: regl.prop('u_basepoint'),
            u_resolution: DOMAIN_OVERLAY_MESH.cells,
            u_tex_resolution: TILE_SIZE,
    
            u_H: regl.prop('u_H'),
            u_N: regl.prop('u_N'),
            u_Q: regl.prop('u_Q'),
            u_view_pos: regl.prop('u_view_pos'),
            u_saturation_point: regl.prop('u_saturation_point'),
            u_y_offset: regl.prop('u_y_offset')
        },
        primitive: 'triangles',
        offset: 0,
        depth: { func: 'lequal' },
        blend: {
            enable: true,
            func: {src: 'src alpha', dst: 'one minus src alpha'}
        },
        count: DOMAIN_OVERLAY_MESH.indices.length * 3.0
    });

    const render_river_curvature = regl({
        framebuffer: null,
        vert: require('./shaders/place-river.vert').default,
        frag: require('./shaders/render-curvature.frag').default,
        attributes: {
            a_position: DOMAIN_OVERLAY_MESH.vertices,
            a_uv: DOMAIN_OVERLAY_MESH.uvs,
            a_id: DOMAIN_OVERLAY_MESH.ids
        },
        elements: DOMAIN_OVERLAY_MESH.indices,
        uniforms: {
            u_transform: regl.prop('u_transform'),
            u_basepoint: regl.prop('u_basepoint'),
            u_resolution: DOMAIN_OVERLAY_MESH.cells,
            u_tex_resolution: TILE_SIZE,

            u_H: regl.prop('u_H'),
            u_K: regl.prop('u_K'),
            u_E: regl.prop('u_E'),
            u_view_pos: regl.prop('u_view_pos'),
            u_saturation_point: regl.prop('u_saturation_point'),
            u_y_offset: regl.prop('u_y_offset')
        },
        primitive: 'triangles',
        offset: 0,
        depth: { func: 'lequal' },
        blend: {
            enable: true,
            func: {src: 'src alpha', dst: 'one minus src alpha'}
        },
        count: DOMAIN_OVERLAY_MESH.indices.length * 3.0
    });

    const render_river_erosion_accretion = regl({
        framebuffer: null,
        vert: require('./shaders/place-river.vert').default,
        frag: require('./shaders/render-erosion-accretion-values-2.frag').default,
        attributes: {
            a_position: DOMAIN_OVERLAY_MESH.vertices,
            a_uv: DOMAIN_OVERLAY_MESH.uvs,
            a_id: DOMAIN_OVERLAY_MESH.ids
        },
        elements: DOMAIN_OVERLAY_MESH.indices,
        uniforms: {
            u_transform: regl.prop('u_transform'),
            u_basepoint: regl.prop('u_basepoint'),
            u_resolution: DOMAIN_OVERLAY_MESH.cells,
            u_tex_resolution: TILE_SIZE,

            u_H: regl.prop('u_H'),
            u_K: regl.prop('u_K'),
            u_Q: regl.prop('u_Q'),
            u_S: regl.prop('u_S'),

            u_k_erosion: regl.prop('u_k_erosion'),
            u_k_accretion: regl.prop('u_k_accretion'),
            u_Q_accretion_upper_bound: regl.prop('u_Q_accretion_upper_bound'),
            u_Q_erosion_lower_bound: regl.prop('u_Q_erosion_lower_bound'),

            u_view_pos: regl.prop('u_view_pos'),
            u_saturation_point: regl.prop('u_saturation_point'),
            u_y_offset: regl.prop('u_y_offset')
        },
        primitive: 'triangles',
        offset: 0,
        depth: { func: 'lequal' },
        blend: {
            enable: true,
            func: {src: 'src alpha', dst: 'one minus src alpha'}
        },
        count: DOMAIN_OVERLAY_MESH.indices.length * 3.0
    });

    return {
        calculate_initial_conditions,
        calculate_testcase_initial_conditions,
        calculate_slope_field,
        calculate_flow_field,
        calculate_flow_field_averaging,
        calculate_edges,
        calculate_edge_normalization_pass_one,
        calculate_edge_normalization_pass_two,
        calculate_curvature,
        calculate_edge_averaging,
        calculate_stream_averaging,
        calculate_erosion_accretion,
        calculate_collapse,
        advance_water_depth,
        calculate_H_boundary_conditions,
        calculate_Q_boundary_conditions,

        calculate_N_normals,

        render_terrain_height,
        render_flux,
        render_erosion_accretion,
        render_flux_magnitude,
        render_slope,
        render_curvature,
        render_section_line,
        render_crosssection,
        render_tile_as_color,
        render_river,
        render_river_depth,
        render_river_flux,
        render_domain,
        render_river_curvature,
        render_river_erosion_accretion
    }
}