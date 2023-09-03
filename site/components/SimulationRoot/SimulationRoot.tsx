'use client'

import { useEffect, useRef, useState } from "react"
import type { Regl } from 'regl'
import { mat3, vec2 } from "gl-matrix"

import parameters from '@/simulation/parameters'
import { compile_shaders } from "@/simulation/compile"
import { RenderContext } from "@/simulation/context"
import * as input from "@/simulation/inputs.js"
import { TARGET_FRAMETIME } from "@/simulation/constants"
import { Simulation } from "@/simulation/simulation"

import { useApplicationState } from "@/store"


export default function SimulationRoot() {
    const baseCanvas = useRef<HTMLCanvasElement>(null)
    const [renderContext, setRenderContext] = useState<RenderContext | null>(null)

    const uiData = useApplicationState(state => state.ui)
    const simData = useApplicationState(state => state.sim)
    const setSimState = useApplicationState(state => state.setSimState)


    /**
     * Initial canvas setup.
     */
    useEffect(() => {
        if (!baseCanvas.current) return;

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
        const localRenderContext = new RenderContext(regl, shaders)
        setRenderContext(localRenderContext)


        // Resize Handler..

        const resizeHandler = () => {
            if (baseCanvas.current == null) return;
            // baseCanvas.current.width = window.innerWidth
            // baseCanvas.current.height = window.innerHeight
            
            // regl._gl.canvas.width = window.innerWidth * 2.0;
            // regl._gl.canvas.height = window.innerHeight * 2.0;
    
            // renderContext.setup_transform();
        }

        window.addEventListener('resize', resizeHandler);

        return () => { 
            window.removeEventListener('resize', resizeHandler);            
        }
    }, [])


    useEffect(() => {
        if (renderContext == null) return;

        // handle drag events.
        // internal state for the drag events...
        let shift_key_is_down = false;

        // game loop
        // TODO(Nic): replace with requestAnimationFrame
        // TODO(Nic): replace with manual canvas and resize canvas appropriately.
        
        let t_minus_1 = performance.now();

        // setReglInstance(regl)
        // NOTE(Nic): this should move to the other event loop.
        input.setup_input_handlers(window)

        const intervalID = setInterval(() => {
            renderContext.handle_input(input)

            renderContext.regl.clear({color: [0, 0, 0, 1]})
            renderContext.setup_transform()
            renderContext.render_tiles(simData, uiData)

            let t = performance.now()
            renderContext.resources.dt = (t - t_minus_1) / 1000
            t_minus_1 = t
        }, TARGET_FRAMETIME * 1000)


        const keydownHandler = (e: KeyboardEvent) => {
            console.log(e.key)

            if (e.key == 'r') {
                const new_tile = new Simulation(
                    'parabola-testcase.png',
                    'parabola-testcase.png',
                    true,
                    renderContext.shaders,
                    renderContext.regl
                );

                renderContext.reset(new_tile);
            }


            if (e.key == 'Shift') {
                shift_key_is_down = true;
            }
    
            if (e.key == ' ') {
                parameters.running = !parameters.running;

                console.log(simData.state.running)
                setSimState({running: !simData.state.running})
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
                renderContext.regl.clear({color: [0, 0, 0, 1]});
                let running = parameters.running;
                parameters.running = true;
                renderContext.setup_transform();
                renderContext.render_tiles(simData, uiData);
                parameters.running = running;
            }
        
        }

        const keyupHandler = (e: KeyboardEvent) => {
            if (e.key == 'Shift') {
                shift_key_is_down = false;
            }
        }

        window.addEventListener('keydown', keydownHandler)
        window.addEventListener('keyup', keyupHandler)

        return () => {
            clearInterval(intervalID)
            window.removeEventListener('keydown', keydownHandler)
            window.removeEventListener('keyup', keyupHandler);
        }
    }, [renderContext, simData, uiData])

    return (
        <canvas ref={baseCanvas} className="h-screen w-screen border" />
    )
}