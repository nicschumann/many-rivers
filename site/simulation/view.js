class View {    
    constructor(x, y, z, testcase=false, shaders=null, regl=null) {
        if (shaders == null) { console.error('No Shaders Supplied to View.') }
        if (regl == null) { console.error('No Regl instance Supplied to View.') }

        this.is_testcase = testcase
        this.shaders = shaders
        this.regl = regl

        this.x = x;
        this.y = y;
        this.z = z;

        this.positions = [
            [this.x, this.y], [this.x + 1, this.y],
            [this.x, this.y + 1], [this.x + 1, this.y + 1]
        ]

        this.uvs = [
            [0, 0], [1, 0],
            [0, 1], [1, 1]
        ]

        this.parent = null
        this.loaded = false
        
        this.loading_color = [0/255, 74/255, 74/255];
    }

    

    update_positions () {
        this.positions = [
            [this.x, this.y], [this.x + 1, this.y],
            [this.x, this.y + 1], [this.x + 1, this.y + 1]
        ]
    }

    set_parent(parent) {
        this.parent = parent;
        // this.x = parent.x;
        // this.y = parent.y;
        // this.z = parent.z;
        // this.update_positions();
    }

    get_resources() {}

    simulate (resources, parameters) {}

    render (resources, parameters) {
        this.shaders.render_tile_as_color({
            a_position: this.positions,
            a_uv: this.uvs,
            u_transform: resources.transform_2d,
            u_color: this.loading_color
        });
    }
}

export { View };