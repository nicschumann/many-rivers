import type { Regl } from "regl";

const xy2i = (x: number, y: number, cells: [number, number]) => {
  return y * (cells[1] + 1) + x;
};

const make_data = (cells: [number, number]) => {
  const dx = 1.0 / cells[0];
  const dy = 1.0 / cells[1];

  let vertices = [];
  let indices = [];
  let uvs = [];
  let ids = [];

  // make verts
  for (let y = 0; y <= cells[1]; y += 1) {
    for (let x = 0; x <= cells[0]; x += 1) {
      vertices.push(
        [x * dx, 0.0, y * dy] // opengl convention
      );

      uvs.push([x * dx + dx / 2.0, y * dy + dy / 2.0]);

      ids.push([x, y]);
    }
  }

  // make tris
  for (let y = 0; y < cells[1]; y += 1) {
    for (let x = 0; x < cells[0]; x += 1) {
      let top_tri = [
        xy2i(x, y, cells),
        xy2i(x + 1, y + 1, cells),
        xy2i(x + 1, y, cells),
      ];

      let bottom_tri = [
        xy2i(x, y, cells),
        xy2i(x, y + 1, cells),
        xy2i(x + 1, y + 1, cells),
      ];

      indices.push(top_tri);
      indices.push(bottom_tri);
    }
  }

  return [vertices, indices, uvs, ids];
};

export class DomainMesh {
  regl: Regl;
  cells: [number, number];
  vertices: number[][];
  indices: number[][];
  uvs: number[][];
  ids: number[][];

  constructor(regl: Regl, dimensions: [number, number]) {
    this.regl = regl;
    this.cells = dimensions;

    let [verts, inds, uvs, ids] = make_data(dimensions);

    this.vertices = verts;
    this.indices = inds;
    this.uvs = uvs;
    this.ids = ids;
  }
}

type BlockSpec = {
  offset: number;
  id: [number, number];
  uv: [number, number];
  basepoint: { x: number; y: number; z: number };
  lengths: { dx: number; dy: number; dz: number };
};

interface BlockData {
  vertices: [number, number, number][];
  uvs: [number, number][]; //
  ids: [number, number][];
  types: number[];
}

interface TriangleBlockData extends BlockData {
  indices: [number, number, number][];
}

interface LineBlockData extends BlockData {
  indices: [number, number][];
}

/**
 * Given a X and Y and Z position, together with a width and height,
 * build the data for a single rectangular block.
 */
const build_triangle_rect_block = (spec: BlockSpec): TriangleBlockData => {
  const { x, y, z } = spec.basepoint;
  const { dx, dy, dz } = spec.lengths;
  const { offset, uv, id } = spec;

  const vertices: [number, number, number][] = [
    // top
    [x, z, y],
    [x + dx, z, y],
    [x, z, y + dy],
    [x + dx, z, y + dy],
    // bottom
    [x, z + dz, y],
    [x + dx, z + dz, y],
    [x, z + dz, y + dy],
    [x + dx, z + dz, y + dy],
  ];

  const indices: [number, number, number][] = [
    // top
    [0, 2, 1],
    [1, 2, 3],
    // west
    [0, 4, 2],
    [2, 4, 6],
    // north
    [1, 5, 0],
    [0, 5, 4],
    // east
    [3, 7, 1],
    [1, 7, 5],
    // south
    [2, 6, 3],
    [3, 6, 7],
    // bottom
    [6, 4, 7],
    [7, 4, 5],
  ].map(([i, j, k]) => [i + offset, j + offset, k + offset]); // adjust for the basepoint

  const uvs = [uv, uv, uv, uv, uv, uv, uv, uv];

  const ids = [id, id, id, id, id, id, id, id];

  const types = [0, 0, 0, 0, 1, 1, 1, 1];

  return {
    vertices,
    indices,
    uvs,
    ids,
    types,
  };
};

const build_line_rect_block = (spec: BlockSpec): LineBlockData => {
  const { x, y, z } = spec.basepoint;
  const { dx, dy, dz } = spec.lengths;
  const { offset, uv, id } = spec;

  const vertices: [number, number, number][] = [
    // top
    [x, z, y],
    [x + dx, z, y],
    [x, z, y + dy],
    [x + dx, z, y + dy],
    // bottom
    [x, z + dz, y],
    [x + dx, z + dz, y],
    [x, z + dz, y + dy],
    [x + dx, z + dz, y + dy],
  ];

  const indices: [number, number][] = [
    // top quad loop
    [0, 1],
    [1, 3],
    [3, 2],
    [2, 0],
    // sides connections
    [0, 4],
    [1, 5],
    [3, 7],
    [2, 6],
    // bottom quad loop
    [4, 5],
    [5, 7],
    [7, 6],
    [6, 4],
  ].map(([i, j]) => [i + offset, j + offset]); // adjust for the basepoint

  const uvs = [uv, uv, uv, uv, uv, uv, uv, uv];

  const ids = [id, id, id, id, id, id, id, id];

  const types = [0, 0, 0, 0, 1, 1, 1, 1];

  return {
    vertices,
    indices,
    uvs,
    ids,
    types,
  };
};

/**
 * This class represents the simulation exactly as a grid of cubes.
 */
export class CubeGridTriangleMesh {
  regl: Regl;
  cells: [number, number];

  // attribute buffers:
  vertices: [number, number, number][]; // vertex positions
  indices: [number, number, number][]; // triangle indices
  uvs: [number, number][]; //
  ids: [number, number][];
  types: number[];

  constructor(regl: Regl, cells: [number, number]) {
    this.regl = regl;
    this.cells = cells;

    const verts_per_cube = 8;
    const [dx, dy] = [1 / cells[0], 1 / cells[1]];
    const [half_dx, half_dy] = [dx / 2.0, dy / 2.0];

    this.vertices = [];
    this.indices = [];
    this.uvs = [];
    this.ids = [];
    this.types = [];

    for (let y = 0; y < cells[1]; y += 1) {
      for (let x = 0; x < cells[0]; x += 1) {
        const offset = verts_per_cube * x + verts_per_cube * cells[0] * y;

        const { vertices, indices, uvs, ids, types } =
          build_triangle_rect_block({
            offset,
            id: [x, y],
            uv: [x * dx + half_dx, y * dy + half_dy],
            lengths: { dx, dy, dz: 0.0 },
            basepoint: {
              x: x * dx,
              y: y * dy,
              z: 0,
            },
          });

        this.vertices.push(...vertices);
        this.indices.push(...indices);
        this.uvs.push(...uvs);
        this.ids.push(...ids);
        this.types.push(...types);
      }
    }
  }
}

export class CubeGridLineMesh {
  regl: Regl;
  cells: [number, number];

  // attribute buffers:
  vertices: [number, number, number][]; // vertex positions
  indices: [number, number][]; // line indices
  uvs: [number, number][]; //
  ids: [number, number][];
  types: number[];

  constructor(regl: Regl, cells: [number, number]) {
    this.regl = regl;
    this.cells = cells;

    const verts_per_cube = 8;
    const [dx, dy] = [1 / cells[0], 1 / cells[1]];
    const [half_dx, half_dy] = [dx / 2.0, dy / 2.0];

    this.vertices = [];
    this.indices = [];
    this.uvs = [];
    this.ids = [];
    this.types = [];

    for (let y = 0; y < cells[1]; y += 1) {
      for (let x = 0; x < cells[0]; x += 1) {
        const offset = verts_per_cube * x + verts_per_cube * cells[0] * y;

        const { vertices, indices, uvs, ids, types } = build_line_rect_block({
          offset,
          id: [x, y],
          uv: [x * dx + half_dx, y * dy + half_dy],
          lengths: { dx, dy, dz: 0.0 },
          basepoint: {
            x: x * dx,
            y: y * dy,
            z: 0,
          },
        });

        this.vertices.push(...vertices);
        this.indices.push(...indices);
        this.uvs.push(...uvs);
        this.ids.push(...ids);
        this.types.push(...types);
      }
    }
  }
}
