import type { Regl } from "regl";

const xy2i = (x: number, y: number, cells: [number, number]) => {
    return y * (cells[1] + 1) + x;
}

const make_data = ( cells: [number, number] ) => {
    const dx = 1.0 / cells[0];
    const dy = 1.0 / cells[1];

    let vertices = [];
    let indices = [];
    let uvs = [];
    let ids = [];

    // make verts
    for (let y = 0; y <= cells[1]; y += 1) {
        for (let x = 0; x <= cells[0]; x += 1 ) {

            vertices.push(
                [x * dx, 0.0, y * dy] // opengl convention
            );

            uvs.push(
                [x * dx + (dx / 2.0), y * dy + (dy / 2.0)]
            );

            ids.push([
                x, y
            ]);
        }
    }

    // make tris
    for (let y = 0; y < cells[1]; y += 1) {
        for (let x = 0; x < cells[0]; x += 1 ) {

            let top_tri = [
                xy2i(x, y, cells),
                xy2i(x + 1, y + 1, cells),
                xy2i(x + 1, y, cells),
            ]

            let bottom_tri = [
                xy2i(x, y, cells),
                xy2i(x, y + 1, cells),
                xy2i(x + 1, y + 1, cells)
            ]

            indices.push(top_tri);
            indices.push(bottom_tri);
        }
    }

    return [vertices, indices, uvs, ids];
}


export class DomainMesh {
    regl: Regl
    cells: [number, number]
    vertices: number[][]
    indices: number[][]
    uvs: number[][]
    ids: number[][]

    constructor (regl: Regl, dimensions: [number, number]) {
        this.regl = regl;
        this.cells = dimensions;

        let [verts, inds, uvs, ids] = make_data(dimensions);

        this.vertices = verts
        this.indices = inds
        this.uvs = uvs
        this.ids = ids
    }
}