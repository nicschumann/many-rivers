import "./style/main.css";
import { vec3, mat3 } from "gl-matrix";
import { DoubleFramebuffer, SingleFramebuffer } from "./buffer";

const regl = require('regl')({
    extensions: [
        'OES_texture_float',
        'OES_texture_float_linear'
    ]
});

const TILE_SIZE = [512, 512];
// const TERRAIN_SIZE = [TILE_SIZE[0] * 2.0, TILE_SIZE[1] * 2.0];

// overall parameters to this model:
const parameters = {
    sediment_height_max: 1.0,
    sediment_height_min: 0.75,

    upper_bank: 0.4,
    lower_bank: 0.6,
    bank_width: 0.01
}

// GPU calls: calculation
const calculate_initial_conditions = regl({
    framebuffer: regl.prop('target'),
    vert: require('./shaders/pass-through.vert'),
    frag: require('./shaders/calculate-initial-conditions.frag'),
    attributes: {
        a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        a_uv: regl.prop('a_uv')
    },
    uniforms: {
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

// GPU calls: update steps

// const calculate_flow_field = regl({
//     framebuffer: regl.prop('target'),
//     vert: require('./shaders/pass-through.vert'),
//     frag: require('./shaders/calculate-Q-field.frag'),
//     attributes: {
//         a_position: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
//         a_uv: regl.prop('a_uv')
//     },
//     uniforms: {},
//     primitive: "triangle strip",
//     count: 4
// });


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

const render_field = regl({
    vert: require('./shaders/place-tile.vert'),
    frag: require('./shaders/render-texture.frag'),
    attributes: {
        a_position: regl.prop('a_position'),
        a_uv: regl.prop('a_uv')
    },
    uniforms: {
        u_transform: regl.prop('u_transform'),
        u_data: regl.prop('u_data'),
        u_scalefactor: regl.prop('u_scalefactor'),
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4  
})

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
        u_resolution: TILE_SIZE
    },
    primitive: "triangle strip",
    count: 4  
})

// const calculate_flux_field = regl({
//     target: regl.prop('target'),
//     vert: require('./shaders/pass-through.vert'),
//     frag: require('./shaders/render-color.frag'),
//     attributes: {
//         a_position: regl.prop('a_position'),
//         a_uv: regl.prop('a_uv')
//     },
//     uniforms: {
//         u_transform: regl.prop('u_transform'),
//         u_color: regl.prop('u_color'),
//         u_k_vel: regl.prop('u_k_vel')
//     },
//     primitive: "triangle strip",
//     count: 4
// })


// CPU Datastructures

class Tile {
    constructor(x, y) {
        this.x = x;
        this.y = y;

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
        // later, this will need to be a function of the grid location...
        
        // these buffers are aligned to the H grid
        this.H = new DoubleFramebuffer(regl, TILE_SIZE);

        // these buffers are aligned to the Q grid
        this.Q = new DoubleFramebuffer(regl, TILE_SIZE);

        calculate_initial_conditions({
            target: this.H.front,
            a_uv: this.uvs,
            u_upper_bank: parameters.upper_bank,
            u_lower_bank: parameters.lower_bank,
            u_bank_width: parameters.bank_width,
            u_sediment_height_max: parameters.sediment_height_max,
            u_sediment_height_min: parameters.sediment_height_min,
        })

        this.loaded = true
    }

    render (transform, resources) {
        if (this.loaded) {

            render_terrain_height({
                u_H: this.H.front,
                u_scalefactor: 0.5,

                a_position: this.positions,
                a_uv: this.uvs,
                u_transform: transform,
            })

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
    // corrected
    constructor () {

        // specify the map you want...
        this.tiles = [
            new Tile(0, 0)
        ];

        this.tile_map = {};
        this.resources = { t: 0.0 };

        this.tile_center = [ 0.5, 0.5 ]

        this.setup_transform();
        this.tiles.forEach(t => t.get_resources() );
    }

    setup_transform() {
        let viewport = [window.innerWidth, window.innerHeight];

        let scalefactors = [
            2 * TILE_SIZE[0] / viewport[0],
            -2 * TILE_SIZE[1] / viewport[1],
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

        this.tiles.forEach((tile, i) => { tile.render(this.transform, this.resources); });
        this.resources.t += 0.001;

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






async function main () {
    let provider = new TileProvider();

    // game loop
    // TODO(Nic): replace with requestAnimationFrame
    // TODO(Nic): replace with manual canvas and resize canvas appropriately.
    setInterval(() => {
        provider.setup_transform();
        provider.render_tiles();
    }, 1000 / 60);

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
}

main();