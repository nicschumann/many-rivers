import "./style/main.css";
import { vec3, mat3 } from "gl-matrix";
import { DoubleFramebuffer, SingleFramebuffer } from "./buffer";

const regl = require('regl')({
    extensions: [
        'OES_texture_float',
        'OES_texture_float_linear'
    ]
});

const RENDER_SCALE = 1.5;
const TILE_SIZE = [512, 512];
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

// overall parameters to this model:
const parameters = {
    running: false,
    render_outflows: true,

    updates_per_render: 1,
}


// GPU calls: initial conditions computations

const ca_H_initial_conditions = regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/ca/calculate-H-initial-conditions.frag'),
    attributes: {
        a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        a_uv: regl.prop('a_uv')
    },
    uniforms: {
        u_elevation: regl.prop('u_elevation'),
        u_boundary: regl.prop('u_boundary'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4
});

const ca_H_boundary_conditions = regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/ca/calculate-H-boundary-conditions.frag'),
    attributes: {
        a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        a_uv: regl.prop('a_uv')
    },
    uniforms: {
        u_H: regl.prop('u_H'),
        u_boundary: regl.prop('u_boundary'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4
});

// GPU calls: state update computations

const ca_N_flows = regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/ca/calculate-N-flows.frag'),
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

const ca_H_flows = regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/ca/calculate-H-flows.frag'),
    attributes: {
        a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        a_uv: regl.prop('a_uv')
    },
    uniforms: {
        u_H: regl.prop('u_H'),
        u_N: regl.prop('u_N'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4
})

const ca_H_outflows = regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/ca/calculate-H-outflows.frag'),
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

const ca_H_inflows = regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/ca/calculate-H-inflows.frag'),
    attributes: {
        a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        a_uv: regl.prop('a_uv')
    },
    uniforms: {
        u_H: regl.prop('u_H'),
        u_O: regl.prop('u_O'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4
})



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

const render_H = regl({
    vert: require('./shaders/place-tile.vert'),
    frag: require('./shaders/ca/render-H-sw.frag'),
    attributes: {
        a_position: regl.prop('a_position'),
        a_uv: regl.prop('a_uv')
    },
    uniforms: {
        u_H: regl.prop('u_H'),

        u_transform: regl.prop('u_transform'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4  
})

const render_O = regl({
    vert: require('./shaders/place-tile.vert'),
    frag: require('./shaders/ca/render-O-outflows.frag'),
    attributes: {
        a_position: regl.prop('a_position'),
        a_uv: regl.prop('a_uv')
    },
    uniforms: {
        u_O: regl.prop('u_O'),

        u_transform: regl.prop('u_transform'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4    
})




// CPU Datastructures

class Tile {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;

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
        const terrain_url = `/data/${this.z}-${this.x}-${this.y}-terrain-blurred-10.png`;
        const boundary_url = `/data/${this.z}-${this.x}-${this.y}-boundary.png`;

        let textures = await Promise.all([ 
            load_image(terrain_url), 
            load_image(boundary_url), 
        ]);

        this.elevation = regl.texture({ data: textures[0], mag: 'linear', min: 'linear' });
        this.boundary = regl.texture({ data: textures[1], mag: 'nearest', min: 'nearest' });

        // these buffers are aligned to the H grid
        this.H = new DoubleFramebuffer(regl, TILE_SIZE);
        this.O = new SingleFramebuffer(regl, TILE_SIZE, 'nearest');

        ca_H_initial_conditions({
            target: this.H.back,
            u_elevation: this.elevation,
            u_boundary: this.boundary,
            a_uv: this.uvs,
        });
        this.H.swap();

        this.loaded = true
    }

    render (transform, resources) {
        if (this.loaded) {
                if (parameters.running) { 
                    // COMPUTE STEPS

                    console.log('running');
                    for (let i = 0; i < parameters.updates_per_render; i++ ){
                        // ca_N_flows({
                        //     target: this.N.buffer,
                        //     u_H: this.H.front,
                        //     a_uv: this.uvs
                        // })

                        ca_H_outflows({
                            target: this.O.buffer,
                            u_H: this.H.front,
                            a_uv: this.uvs
                        })

                        ca_H_inflows({
                            target: this.H.back,
                            u_H: this.H.front,
                            u_O: this.O.buffer,
                            a_uv: this.uvs
                        })
                        this.H.swap();
    
                        // ca_H_flows({
                        //     target: this.H.back,
                        //     u_H: this.H.front,
                        //     u_N: this.N.buffer,
                        //     a_uv: this.uvs
                        // });
                        // this.H.swap();
    
                        ca_H_boundary_conditions({
                            target: this.H.back,
                            u_H: this.H.front,
                            u_boundary: this.boundary,
                            a_uv: this.uvs
                        });
                        this.H.swap();
                    }
                }

                // RENDERING STEPS:
                regl.clear({depth: 1.})
                render_H({
                    u_H: this.H.front,
                    a_position: this.positions,
                    u_transform: transform,
                    a_uv: this.uvs,
                });

                if (parameters.render_outflows) {
                    regl.clear({depth: 1.});
                    render_O({
                        u_O: this.O.buffer,
                        a_position: this.positions,
                        u_transform: transform,
                        a_uv: this.uvs,
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

// TileProvider
class TileProvider {
    constructor () {

        // specify the map you want...
        this.tiles = [
            new Tile(1878, 3483, 13) // matamoros/brownsville data
        ];

        this.tile_map = {};
        this.resources = { t: 0.0 };

        this.tile_center = [ 1878.5, 3483.5 ]

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
        this.resources.t += 1;

        let e = performance.now();
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
        if (typeof parameters[key] == 'boolean') {
            input_container.appendChild(title_span);
            input_container.appendChild(input_element);
            container.appendChild(input_container);
        }
    })
}

async function main () {
    let provider = new TileProvider();

    // game loop
    // TODO(Nic): replace with requestAnimationFrame
    // TODO(Nic): replace with manual canvas and resize canvas appropriately.
    
    
    setInterval(() => {
        // regl.clear({color: [0, 0, 0, 1]});
        provider.setup_transform();
        provider.render_tiles();
    }, 1000 / 30);

    // handle drag events.
    // internal state for the drag events...
    let mouse_is_down = false;
    let last_coords = [0, 0];


    window.addEventListener('mousedown', e => {
        mouse_is_down = true
        last_coords = [e.clientX, e.clientY];
    })

    window.addEventListener('mousemove', e => {
        if (mouse_is_down) {
            let [dx, dy] = [e.clientX - last_coords[0], e.clientY - last_coords[1]];
            last_coords = [e.clientX, e.clientY];

            provider.update_center([
                -dx / window.innerWidth * 2.0, 
                -dy / window.innerHeight * 2.0
            ]);

            // NOTE(Nic): turned off tile updating to debug shadow shading.
            // provider.update_tiles();
        }
    });

    window.addEventListener('mouseup', () => {
        mouse_is_down = false
    })

    window.addEventListener('keydown', e => {
        console.log(e.key);
        if (e.key == ' ') {
            parameters.running = !parameters.running;
            document.getElementById('running').checked = parameters.running;
        }

        if (e.key == 'ArrowRight') {
            let running = parameters.running;
            parameters.running = true;
            provider.setup_transform();
            provider.render_tiles();
            parameters.running = running;
        }

        if (e.key == 'o') {
            parameters.render_outflows = !parameters.render_outflows;
        }
    })
}

setup_controls()
main();