import { mat3 } from "gl-matrix";



// import {View3DWireframe} from './View3dWireframe.js'
import {View2D} from './view2d.js'
import {View3D} from './view3d.js'
import {CrossSection} from './section.js'
import {Simulation} from './simulation.js'
import {Camera} from './camera.js'

import { TERRAIN_SIZE, RENDER_SCALE, TARGET_FRAMETIME } from "./constants";

class RenderContext {
    constructor (parameters, regl=null, shaders=null) {
        if (shaders == null) { console.error('No Shaders Supplied to RenderContext.') }
        if (regl == null) { console.error('No Regl instance Supplied to RenderContext.') }

        this.regl = regl
        this.shaders = shaders
        this.parameters = parameters


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


        this.tiles = [
            
            

            new View3D(0, 0, 0, true, shaders, regl),
            
            // new View3DWireframe(0, 0, 0, true),

            new View2D(-1.75, 1.25, 0, true, shaders, regl),
            
            new CrossSection(-0.75, 1.25, 0, true, shaders, regl),
        ];

        // hook up the cross section renderer
        this.tiles.forEach(t => t.set_parent(this.simulation) );

        this.tile_map = {};

        this.resources = { 
            last_mouse_coords: [0,0],
            dt: TARGET_FRAMETIME,
            t: 0.0,
            camera: new Camera(
                [this.tiles[0].x + 0.0, 0.25, this.tiles[0].y + 0.0],
                [this.tiles[0].x + 0.5, 0.0, this.tiles[0].y + 0.5]
            ),
            transform_2d: []
        };

        this.tile_center = [ this.tiles[0].x + 1.0, this.tiles[0].y + 0.5]

        this.setup_transform();
        this.simulation.get_resources(parameters);
        this.tiles.forEach(t => t.get_resources(parameters) );
    }

    handle_input(input) {
        let [x, y] = input.mouse_pos();

        if (input.mouse_is_down() && !input.key_is_down('Shift') ) {
            let [old_x, old_y] = this.resources.last_mouse_coords;
            let [dx, dy] = [x - old_x, y - old_y];
            console.log(dx, dy);            

            this.update_center([
                -dx / window.innerWidth * 2.0 * (1 / RENDER_SCALE), 
                -dy / window.innerHeight * 2.0 * (1 / RENDER_SCALE)
            ]);
        }

        this.resources.last_mouse_coords = [x, y];

        this.resources.camera.handle_input(input);
    }

    reset(tile=null) {
        if (tile !== null) { this.simulation = tile; }

        this.setup_transform();
        this.simulation.get_resources();
        this.tiles.forEach(t => t.set_parent(this.simulation) );
        this.tiles.forEach(t => t.get_resources() );
        this.resources.t = 0;
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
        
        this.resources.transform_2d = mat3.multiply([], T_scale, T_trans);
    }

    render_tiles () {
        let s = performance.now();

        this.simulation.simulate(this.resources, this.parameters);
        this.resources.camera.step(this.resources, this.parameters);

        this.tiles.forEach((tile) => {
            this.regl.clear({depth: 1.0});
            tile.render(this.resources, this.parameters); 
        });

        this.resources.t += (this.parameters.running) ? 1 : 0;
        
        // let e = performance.now();
        // console.log(`total render: ${e - s}ms`);
    }

    update_center ([d_x, d_y]) {
        this.tile_center[0] += d_x;
        this.tile_center[1] += d_y;
    }
}

export { RenderContext }