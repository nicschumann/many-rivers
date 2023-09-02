import { DEFAULT_INTERPOLATION } from "./constants";

const create_linear_buffer = (regl, resolution, filter=DEFAULT_INTERPOLATION) => {
    let color = regl.texture({
        shape: [resolution[0], resolution[1], 4],
        min: filter,
        mag: filter,
        wrapS: 'clamp',
        wrapT: 'clamp',
        type: 'float'
    });

    /**
     * TODO(Nic): Consider using a renderbuffer here, which may be faster than
     * a framebuffer or texture for off-screen rendering, because it uses an 
     * implementation dependent storage format. (Presumably can still
     * be sampled like a texture?) Notes [here](https://github.com/regl-project/regl/blob/master/API.md#renderbuffers).
     */
    return regl.framebuffer({
        color,
        depth: false,
        stencil: false
    });
}


export class SingleFramebuffer {
    constructor(regl, resolution, filter=DEFAULT_INTERPOLATION) {
        this.buffer = create_linear_buffer(regl, resolution, filter);
    }

    destroy() {
        this.buffer.destroy();
    }
}

export class DoubleFramebuffer {
    constructor(regl, resolution, filter=DEFAULT_INTERPOLATION) {
        this.tmp = null;
        this.front = create_linear_buffer(regl, resolution, filter);
        this.back = create_linear_buffer(regl, resolution, filter);
    }
  
    swap() {
      this.tmp = this.front;
      this.front = this.back;
      this.back = this.tmp;
    }

    destroy() {
        this.front.destroy();
        this.back.destroy();
    }
}
  