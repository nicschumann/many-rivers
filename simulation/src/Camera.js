import { vec3, mat4 } from "gl-matrix";

export class Camera {
    world_up = [0., -1., 0.]

    constructor (position, target) {
        this.input_forces = [];
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
        this.get_vectors();

        if (input.key_is_down("ArrowUp")) {
            this.input_forces.push(this.front);
        }

        if (input.key_is_down("ArrowDown")) {
            let dir = vec3.negate([], this.front);
            this.input_forces.push(dir);
        }

        if (input.key_is_down('ArrowLeft')) {
            let dir = this.right;
            this.input_forces.push(dir);
        }

        if (input.key_is_down('ArrowRight')) {
            let dir = vec3.negate([], this.right);
            this.input_forces.push(dir);
        }
    }

    step(resources, parameters) {
        let { dt } = resources;

        // NOTE(Nic): velocity version, useful for applying forces, but larger error term.
        const new_pos = vec3.zero([])
        const new_vel = vec3.zero([])
        const new_acc = vec3.zero([]);
        const new_force = vec3.zero([]);
        const drag_force = vec3.zero([]);
        const target_distance = vec3.sub([], this.target, this.position);

        // position
        vec3.scaleAndAdd(new_pos, this.position, this.velocity, dt);
        vec3.scaleAndAdd(new_pos, new_pos, this.acceleration, dt * dt)

        // acceleration

        if (this.input_forces.length > 0) {
            
            this.input_forces.forEach(force => {
                vec3.add(new_force, new_force, force);
            })
            vec3.normalize(new_force, new_force);
            vec3.scale(new_force, new_force, this.force_scale);

        } else {
            vec3.scale(drag_force, vec3.negate([], this.velocity), 7.5);
        }

        
        // vec3.scale(drag_force, vec3.multiply(drag_force, this.velocity, this.velocity), 0.5 * drag_coeff);
        // vec3.scale(drag_force, drag_force, 1.0 / this.mass);
        vec3.add(new_acc, new_force, drag_force);

        // velocity
        vec3.scaleAndAdd(new_vel, this.velocity, vec3.add([], this.acceleration, new_acc), dt * 0.5);
        // console.log(new_acc)
        // console.log(new_vel);
        // console.log(vec3.length(new_vel) < vec3.length(this.velocity));

        if (vec3.length(new_vel) < 0.0001) { vec3.zero(new_vel);}

        this.position = new_pos;
        this.target = vec3.add(this.target, new_pos, target_distance);
        this.velocity = new_vel;
        this.acceleration = new_acc;

        this.input_forces = [];
    }

    get_vectors() {
        vec3.subtract(this.front, this.target, this.position);
        vec3.normalize(this.front, this.front);

        vec3.cross(this.right, this.front, this.world_up);
        vec3.normalize(this.right, this.right);

        vec3.cross(this.up, this.front, this.right);
        vec3.normalize(this.up, this.up);
    }

    get_matrix() {
        this.get_vectors();
        mat4.lookAt(this.V, this.position, this.target, this.up);
        mat4.perspective(this.P, Math.PI / 4.0, window.innerWidth / window.innerHeight, 0.001, 100.0);

        const PV = mat4.multiply([], this.P, this.V);
        
        return PV;
    }
}