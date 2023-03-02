import { vec3, mat4 } from "gl-matrix";

export class Camera {
    world_up = [0., -1., 0.]

    constructor (position, target) {
        this.force = vec3.zero([])
        this.acceleration = vec3.zero([]);
        this.velocity = vec3.zero([]);
        // verlet state variables.
        this.position = position;
        this.previous_position = position;
        
        this.target = target;
        
        this.drag = 1.0;
        this.mass = 1.0;
        this.force_scale = 0.5;

        this.front = []
        this.right = []
        this.up = []

        this.V = []
        this.P = []
    }

    handle_input(input) {
        if (input.key_is_down("ArrowUp")) {
            let diff = vec3.sub([], this.target, this.position);
            vec3.normalize(diff, diff);
            vec3.add(this.force, this.force, diff);
            // this should be a force that goes into acceleration, 
            // not acceleration itself.
            // this.acceleration = diff;
        }
    }

    step(resources, parameters) {
        let { dt } = resources;

        // NOTE(Nic): Position only version
        // const old_pos = vec3.copy([], this.position);
        // const new_pos = vec3.zero([]);
        
        // // 2.0 * pos - prev_pos + acc * dt^2
        // vec3.scaleAndAdd(new_pos, vec3.scale([], this.previous_position, -1.0), this.position, 2.0);
        // vec3.scaleAndAdd(new_pos, new_pos, this.acceleration, dt * dt);

        // vec3.scale(this.acceleration, this.acceleration, 0.5);
        // if (vec3.length(this.acceleration) < 0.001) { 
        //     vec3.zero(this.acceleration);
        // }

        // this.previous_position = old_pos;
        // this.position = new_pos;

        // NOTE(Nic): velocity version, useful for applying forces, but larger error term.
        const new_pos = vec3.zero([])
        const new_vel = vec3.zero([])
        const new_acc = vec3.zero([])
        const drag_force = vec3.zero([]);

        // position
        vec3.scaleAndAdd(new_pos, this.position, this.velocity, dt);
        vec3.scaleAndAdd(new_pos, new_pos, this.acceleration, dt * dt)

        // acceleration

        if (vec3.length(this.force) > 0) {
            vec3.scale(this.force, vec3.normalize([], this.force), this.force_scale)
        } else {
            vec3.scale(drag_force, vec3.negate([], this.velocity), 7.5);
        }

        
        // vec3.scale(drag_force, vec3.multiply(drag_force, this.velocity, this.velocity), 0.5 * drag_coeff);
        // vec3.scale(drag_force, drag_force, 1.0 / this.mass);
        vec3.add(new_acc, this.force, drag_force);

        // velocity
        vec3.scaleAndAdd(new_vel, this.velocity, vec3.add([], this.acceleration, new_acc), dt * 0.5);
        // console.log(new_acc)
        // console.log(new_vel);
        // console.log(vec3.length(new_vel) < vec3.length(this.velocity));

        if (vec3.length(new_vel) < 0.0001) { vec3.zero(new_vel);}

        this.position = new_pos;
        this.velocity = new_vel;
        this.acceleration = new_acc;

        vec3.zero(this.force);
    }

    get_matrix () {
        vec3.subtract(this.front, this.target, this.position);
        vec3.cross(this.right, this.front, this.world_up);
        vec3.cross(this.up, this.front, this.right);

        mat4.lookAt(this.V, this.position, this.target, this.up);
        mat4.perspective(this.P, Math.PI / 4.0, window.innerWidth / window.innerHeight, 0.001, 100.0);

        const PV = mat4.multiply([], this.P, this.V);
        
        return PV;
    }
}