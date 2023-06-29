import { vec2, vec3, mat3, mat4 } from "gl-matrix";
import parameters from './parameters';
import * as input from './inputs.js';

import { TERRAIN_SIZE, RENDER_SCALE, TARGET_FRAMETIME } from "./constants";

// assigning regl as a global
// so that we have access to it in all modules.
window.regl = require('regl')({
    attributes: {preserveDrawingBuffer: true},
    extensions: [
        'OES_texture_float',
        'OES_texture_float_linear',
        'OES_element_index_uint',
        'OES_standard_derivatives',
        'EXT_shader_texture_lod'
    ]
});

// these need to be imported dynamically,
// because they assume regl is defined globally.
// they all need to be able to access the same regl instance.

const {View3D} = require('./View3d.js');
const {View3DWireframe} = require('./View3dWireframe.js');
const {View2D} = require('./View2d.js');
const {CrossSection} = require('./CrossSection.js');
const {Tile} = require('./Simulation.js');
const {Camera} = require('./Camera.js');

class TileProvider {
    constructor () {

        // this.simulation = new Tile(
        //     'simple-sine-testcase.png', // terrain map
        //     'simple-sine-testcase.png', // boundary map
        //     true // is this a testcase?
        // );

        this.simulation = new Tile(
            '15-0-0-terrain.png', // terrain map
            '15-0-0-boundary-all.png', // boundary map
            false // is this a testcase?
        );

        this.tiles = [
            
            

            new View3D(0, 0, 0, true),
            
            // new View3DWireframe(0, 0, 0, true),

            new View2D(-1.75, 1.25, 0, true),
            
            new CrossSection(-0.75, 1.25, 0, true),
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

        this.simulation.simulate(this.resources, parameters);
        this.resources.camera.step(this.resources, parameters);

        this.tiles.forEach((tile) => {
            regl.clear({depth: 1.0});
            tile.render(this.resources, parameters); 
        });

        this.resources.t += (parameters.running) ? 1 : 0;
        
        // let e = performance.now();
        // console.log(`total render: ${e - s}ms`);
    }

    update_center ([d_x, d_y]) {
        this.tile_center[0] += d_x;
        this.tile_center[1] += d_y;
    }
}




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

async function main () {
    let provider = new TileProvider();
    let counter_icon = document.getElementById('timestep-container');

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

    setInterval(() => {
        
        // TODO(Nic): Add window resize handler here, please...
        provider.handle_input(input);

        regl.clear({color: [0, 0, 0, 1]});
        provider.setup_transform();
        provider.render_tiles();

        if (parameters.running) { 
            let i = provider.resources.t;
            counter_icon.innerText = 
                `${i} (${i * parameters.updates_per_frame}) [${(i / 60).toFixed(2)}s]`;
        }

        let t = performance.now()
        provider.resources.dt = (t - t_minus_1) / 1000; // convert ms to s.
        t_minus_1 = t;

    }, TARGET_FRAMETIME * 1000); // convert s to ms.

    

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
        
        if (mouse_is_down && shift_key_is_down) {

            let tile = provider.tiles[0] // anchor tile for now
            // NOTE(Nic): we don't need to invert this every click...
            let T_inv = mat3.invert([], provider.resources.transform_2d);

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
                const new_tile = new Tile(
                    'parabola-testcase.png',
                    'parabola-testcase.png',
                    true
                );

                provider.reset(new_tile);
            }


            if (e.key == 'Shift') {
                shift_key_is_down = true;
            }
    
            if (e.key == ' ') {
                parameters.running = !parameters.running;
                document.getElementById('running').checked = parameters.running;
            }

            // if (e.key == 'ArrowUp') {
            //     let c = provider.resources.camera;
            //     let diff = vec3.sub([], c.target, c.position);
            //     vec3.normalize(diff, diff);
            //     vec3.scale(diff, diff, 0.01);
            //     vec3.add(c.position, c.position, diff);
            // }

            // if (e.key == 'ArrowDown') {
            //     let c = provider.resources.camera;
            //     let diff = vec3.sub([], c.target, c.position);
            //     vec3.normalize(diff, diff);
            //     vec3.scale(diff, diff, -0.01);
            //     vec3.add(c.position, c.position, diff);
            // }

            // if (e.key == 'ArrowLeft') {
            //     let c = provider.resources.camera;
            //     let diff = vec3.sub([], c.target, c.position);
            //     vec3.normalize(diff, diff);
            //     vec3.cross(diff, c.up, diff);
            //     vec3.scale(diff, diff, 0.01);
            //     vec3.add(c.position, c.position, diff);
            // }

            // if (e.key == 'ArrowRight') {
            //     let c = provider.resources.camera;
            //     let diff = vec3.sub([], c.target, c.position);
            //     vec3.normalize(diff, diff);
            //     vec3.cross(diff, c.up, diff);
            //     vec3.scale(diff, diff, -0.01);
            //     vec3.add(c.position, c.position, diff);
            // }
    
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
    
            if (e.key == 'q') {
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

input.setup_input_handlers();
setup_controls()
main();