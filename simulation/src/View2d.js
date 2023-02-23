import { TILE_SIZE } from './constants'
import { View } from './View'

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
        u_E: regl.prop('u_E'),
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

class View2D extends View {
    render(resources, parameters) {
        if (this.parent.loaded) {
            
            // 2D RENDERING STEPS:
            let transform = resources.transform_2d;

            regl.clear({depth: 1.0});
            render_terrain_height({
                u_H: this.parent.H.front,
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
                    u_Q: this.parent.Q.front,
                    u_H: this.parent.H.front,
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
                    u_Q: this.parent.Q.front,
                    u_H: this.parent.H.front,
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
                    u_S: this.parent.S.buffer,
                    u_K: this.parent.K.front,
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
                    u_H: this.parent.H.front,
                    u_K: this.parent.K.front,
                    u_E: this.parent.E.front,
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
                    u_H: this.parent.H.front,
                    u_K: this.parent.K.front,
                    u_Q: this.parent.Q.front,
                    u_S: this.parent.S.buffer,

                    u_k_erosion: parameters.erosion_speed,
                    u_k_accretion: parameters.accretion_speed,
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

        } else if (!this.parent.loaded) {
            console.log('still loading!');
            // If we're still waiting for textures...
            super.render(transform, resources, parameters);

        }
    }
}

export {View2D};