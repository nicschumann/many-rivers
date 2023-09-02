'use client'

import { useEffect, useRef, useState } from "react"
import type { Regl } from 'regl'
import { mat3, vec2 } from "gl-matrix"

import parameters from '@/simulation/parameters'
import { compile_shaders } from "@/simulation/compile"
import { RenderContext } from "@/simulation/context.js"
import * as input from "@/simulation/inputs.js"
import { TARGET_FRAMETIME } from "@/simulation/constants"
import { Simulation } from "@/simulation/simulation"


export default function SimulationRoot() {
    const baseCanvas = useRef(null)
    const [reglInstance, setReglInstance] = useState(null)

    /**
     * Initial canvas setup.
     */
    useEffect(() => {
        if (!baseCanvas.current) return;

        console.log(input)

        baseCanvas.current.width = window.innerWidth
        baseCanvas.current.height = window.innerHeight

        const regl : Regl = require('regl')({
            canvas: baseCanvas.current,
            attributes: {preserveDrawingBuffer: true},
            extensions: [
                'OES_texture_float',
                'OES_texture_float_linear',
                'OES_element_index_uint',
                'OES_standard_derivatives',
                'EXT_shader_texture_lod'
            ]
        })

        

        const shaders = compile_shaders(regl)

        // @ts-ignore
        const renderContext = new RenderContext(parameters, regl, shaders)


        // handle drag events.
        // internal state for the drag events...
        let mouse_is_down = false;
        let last_coords = [0, 0];
        let current_p_update = 0;
        let shift_key_is_down = false;

        // game loop
        // TODO(Nic): replace with requestAnimationFrame
        // TODO(Nic): replace with manual canvas and resize canvas appropriately.
        
        let t_minus_1 = performance.now();

        // setReglInstance(regl)
        input.setup_input_handlers(window)

        const intervalID = setInterval(() => {
            renderContext.handle_input(input)

            regl.clear({color: [0, 0, 0, 1]})
            renderContext.setup_transform()
            renderContext.render_tiles()

            let t = performance.now()
            renderContext.resources.dt = (t - t_minus_1) / 1000
            t_minus_1 = t
        }, TARGET_FRAMETIME * 1000)

        // Resize Handler..
        window.addEventListener('resize', () => {
            if (baseCanvas.current == null) return;

            // baseCanvas.current.width = window.innerWidth
            // baseCanvas.current.height = window.innerHeight
            
            // regl._gl.canvas.width = window.innerWidth * 2.0;
            // regl._gl.canvas.height = window.innerHeight * 2.0;
    
            // renderContext.setup_transform();
        });

        window.addEventListener('mousedown', e => {
            mouse_is_down = true
            last_coords = [e.clientX, e.clientY];
        })

        window.addEventListener('mousemove', e => {
        
            if (mouse_is_down && shift_key_is_down) {
    
                let tile = renderContext.tiles[0] // anchor tile for now
                // NOTE(Nic): we don't need to invert this every click...
                let T_inv = mat3.invert([], renderContext.resources.transform_2d);
    
                let pos_s = [2.0 * e.clientX/window.innerWidth - 1, 2.0 * (1.0 - e.clientY/window.innerHeight) - 1.0]
                let pos_c = vec2.transformMat3([], pos_s, T_inv);
                
                // TODO(Nic): refactor this to actually work, now 
                // that we have multiple simultaneous rendering available.
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
    
                if (e.key == 'r') {
                    const new_tile = new Simulation(
                        'parabola-testcase.png',
                        'parabola-testcase.png',
                        true,
                        shaders,
                        regl
                    );
    
                    renderContext.reset(new_tile);
                }
    
    
                if (e.key == 'Shift') {
                    shift_key_is_down = true;
                }
        
                if (e.key == ' ') {
                    parameters.running = !parameters.running;
                    // document.getElementById('running').checked = parameters.running;
                }
        
                if (e.key == 'f') {
                    parameters.render_flux = !parameters.render_flux;
                    parameters.render_slope = false;
                    parameters.render_flux_magnitude = false;
                    // document.getElementById('render_flux').checked = parameters.render_flux;
                    parameters.render_curvature = false;
                    parameters.render_erosion_accretion = false;
                }
        
                if (e.key == 'm') {
                    parameters.render_flux_magnitude = !parameters.render_flux_magnitude;
                    parameters.render_flux = false;
                    parameters.render_slope = false;
                    // document.getElementById('render_flux').checked = parameters.render_flux;
                    parameters.render_curvature = false;
                    parameters.render_erosion_accretion = false;
                }
        
                if (e.key == 'c') {
                    parameters.render_flux = false;
                    parameters.render_flux_magnitude = false;
                    parameters.render_slope = false;
                    parameters.render_curvature = !parameters.render_curvature;
                    // document.getElementById('render_curvature').checked = parameters.render_curvature;
                    parameters.render_erosion_accretion = false;
                }
        
                if (e.key == 'e') {
                    parameters.render_flux = false;
                    parameters.render_flux_magnitude = false;
                    parameters.render_slope = false;
                    parameters.render_curvature = false;
                    parameters.render_erosion_accretion = !parameters.render_erosion_accretion;
                    // document.getElementById('render_erosion_accretion').checked = parameters.render_erosion_accretion;
                }
        
                if (e.key == 'q') {
                    parameters.render_flux = false;
                    parameters.render_flux_magnitude = false;
                    parameters.render_curvature = false;
                    parameters.render_slope = !parameters.render_slope;
                    parameters.render_erosion_accretion = false;
                    // document.getElementById('render_slope').checked = parameters.render_slope;
                }
        
                if (e.key == 'ArrowRight') {
                    regl.clear({color: [0, 0, 0, 1]});
                    let running = parameters.running;
                    parameters.running = true;
                    renderContext.setup_transform();
                    renderContext.render_tiles();
                    parameters.running = running;
                }
            
        })
    
        window.addEventListener('keyup', e => {
            if (e.key == 'Shift') {
                shift_key_is_down = false;
                current_p_update = 0;
            }
        })


        return () => { 

            clearInterval(intervalID)
        }
    }, [])

    return (
        <canvas ref={baseCanvas} className="h-screen w-screen border" />
    )
}