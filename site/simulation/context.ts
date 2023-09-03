import { mat3, vec2 } from "gl-matrix";

import {View2D} from './view2d'
import {View3D} from './view3d.js'
import {CrossSection} from './section.js'
import {Simulation} from './simulation'
import {Camera} from './camera.js'

import { TERRAIN_SIZE, RENDER_SCALE, TARGET_FRAMETIME } from "./constants";
import { SimulationData, UIData } from "@/store/index.js";
import { Regl } from "regl";
import { CompiledDrawCalls } from "./compile.js";
import { View } from "./view.js";

export type RenderResources = {
    last_mouse_coords: vec2
    dt: number
    t: number
    camera: Camera
    transform_2d: mat3
}

class RenderContext {
    regl: Regl
    shaders: CompiledDrawCalls
    simulation: Simulation
    views: View[]
    resources: RenderResources
    tile_center: vec2

    constructor (regl: Regl, shaders: CompiledDrawCalls) {
        if (typeof shaders == 'undefined') { console.error('No Shaders Supplied to RenderContext.') }
        if (typeof regl == 'undefined') { console.error('No Regl instance Supplied to RenderContext.') }

        this.regl = regl
        this.shaders = shaders


        // this.simulation = new Tile(
        //     'simple-sine-testcase.png', // terrain map
        //     'simple-sine-testcase.png', // boundary map
        //     true // is this a testcase?
        // );

        // erosion speed: 0.02, accretion speed: 0.01
        this.simulation = new Simulation(
            'usgs-el-horcon-terrain.png', // terrain map
            'usgs-el-horcon-terrain-boundary-simplified-flows.png', // boundary map
            false, // is this a testcase?
            shaders,
            regl
        );

        // this.simulation = new Simulation(
        //     'usgs-la-burrita-terrain.png', // terrain map
        //     'usgs-la-burrita-terrain-boundary-simplified-flows.png', // boundary map
        //     false, // is this a testcase?
        //     shaders,
        //     regl
        // );


        this.views = [
            
            

            new View3D(0, 0, 0, true, shaders, regl),
            
            // new View3DWireframe(0, 0, 0, true),

            // new View2D(-1.75, 1.25, 0, true, shaders, regl),
            
            // new CrossSection(-0.75, 1.25, 0, true, shaders, regl),
        ];

        // hook up the cross section renderer
        this.views.forEach(t => t.set_parent(this.simulation) );

        this.resources = { 
            last_mouse_coords: [0,0],
            dt: TARGET_FRAMETIME,
            t: 0.0,
            camera: new Camera(
                [this.views[0].x + 0.0, 0.25, this.views[0].y + 0.0],
                [this.views[0].x + 0.5, 0.0, this.views[0].y + 0.5]
            ),
            transform_2d: mat3.create()
        };

        this.tile_center = [this.views[0].x + 1.0, this.views[0].y + 0.5]

        this.setup_transform();
        this.simulation.get_resources();
        this.views.forEach(t => t.get_resources() );
    }

    handle_input(input: any) {
        let pos = input.mouse_pos();

        if (input.mouse_is_down() && !input.key_is_down('Shift') ) {
            // @ts-ignore
            let [dx, dy] = vec2.sub([], pos, this.resources.last_mouse_coords)

            this.update_center([
                -dx / window.innerWidth * 2.0 * (1 / RENDER_SCALE), 
                -dy / window.innerHeight * 2.0 * (1 / RENDER_SCALE)
            ]);
        }

        this.resources.last_mouse_coords = pos

        this.resources.camera.handle_input(input);
    }

    reset(tile : Simulation | null = null) {
        if (tile !== null) { this.simulation = tile; }

        this.setup_transform();
        this.simulation.get_resources();
        this.views.forEach(t => t.set_parent(this.simulation) );
        this.views.forEach(t => t.get_resources() );
        this.resources.t = 0;
    }

    setup_transform() {
        let viewport = [window.innerWidth, window.innerHeight];

        let scalefactors = [
            2 * TERRAIN_SIZE[0] / viewport[0],
            -2 * TERRAIN_SIZE[1] / viewport[1],
        ]

        // @ts-ignore
        let T_trans = mat3.fromTranslation([], [
            -this.tile_center[0],
            -this.tile_center[1]
        ])

        // @ts-ignore
        let T_scale = mat3.fromScaling([], scalefactors);
        
        // @ts-ignore
        this.resources.transform_2d = mat3.multiply([], T_scale, T_trans);
    }

    render_tiles (simdata: SimulationData, uidata: UIData) {
        let s = performance.now();

        this.simulation.simulate(this.resources, simdata);
        this.resources.camera.step(this.resources, simdata);

        this.views.forEach((view) => {
            this.regl.clear({depth: 1.0});
            view.render(this.resources, simdata, uidata); 
        });

        this.resources.t += (simdata.state.running) ? 1 : 0;
        
        // let e = performance.now();
        // console.log(`total render: ${e - s}ms`);
    }

    update_center ([d_x, d_y]: number[]) {
        this.tile_center[0] += d_x;
        this.tile_center[1] += d_y;
    }
}

export { RenderContext }