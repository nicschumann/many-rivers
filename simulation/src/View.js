class View {
    constructor(testcase=False) {
        this.is_testcase = testcase

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
        this.x = parent.x;
        this.y = parent.y;
        this.z = parent.z;
        this.update_positions();
    }

    get_resources() {}

    simulate (transform, resources, parameters) {}

    render (transform, resources, parameters) {}
}

export { View };