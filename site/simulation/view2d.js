import { View } from './view'

class View2D extends View {
    render(resources, parameters) {
        if (this.parent.loaded) {
            
            // 2D RENDERING STEPS:
            let transform = resources.transform_2d;

            this.regl.clear({depth: 1.0});
            this.shaders.render_terrain_height({
                u_H: this.parent.H.front,
                u_scalefactor: 0.5,
                u_saturation_point: parameters.saturation_point,

                a_position: this.positions,
                a_uv: this.uvs,
                u_transform: transform,
            });

            if (parameters.render_flux)
            {
                this.regl.clear({depth: 1.0});
                this.shaders.render_flux({
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
                this.regl.clear({depth: 1.0});
                this.shaders.render_flux_magnitude({
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
                this.regl.clear({depth: 1.0});
                this.shaders.render_slope({
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
                this.regl.clear({depth: 1.0});
                this.shaders.render_curvature({
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
                this.regl.clear({depth: 1.0});
                this.shaders.render_erosion_accretion({
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

            this.regl.clear({depth: 1.0});
            this.shaders.render_section_line({
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
            super.render(resources, parameters);

        }
    }
}

export {View2D};