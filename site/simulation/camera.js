import { vec2, vec3, mat4 } from "gl-matrix";

export class Camera {
  world_up = [0, -1, 0];
  min_velocity_magnitude = 0.0001;
  sensitivity = 10.0;

  constructor(position, target) {
    // free look variables
    this.mouse_pos = [0, 0];
    this.last_mouse_pos = [0, 0];
    this.rotations = [0, 0]; // theta, phi | rotation around up, rotation around right.

    // state variables
    this.input_forces = [];
    this.acceleration = vec3.zero([]);
    this.velocity = vec3.zero([]);
    this.position = position;

    // look target
    this.target = target;

    // "feel"
    this.drag = 1.0;
    this.mass = 1.0;
    this.force_scale = 0.5;

    // camera vectors
    this.front = [];
    this.right = [];
    this.up = [];

    // camera matrices
    this.V = [];
    this.P = [];
  }

  handle_input(input) {
    this.get_vectors();

    this.last_mouse_pos = this.mouse_pos;
    this.mouse_pos = input.mouse_pos();

    if (input.pointer_is_locked()) {
      let [dx, dy] = input.mouse_delta();
      let theta = (-this.sensitivity * dx * Math.PI) / 180.0;
      let phi = (-this.sensitivity * dy * Math.PI) / 180.0;

      this.rotations = [theta, phi];
      input.reset_mouse_delta();
    }

    if (input.key_is_down("w")) {
      this.input_forces.push(this.front);
    }

    if (input.key_is_down("s")) {
      let dir = vec3.negate([], this.front);
      this.input_forces.push(dir);
    }

    if (input.key_is_down("a")) {
      let dir = this.right;
      this.input_forces.push(dir);
    }

    if (input.key_is_down("d")) {
      let dir = vec3.negate([], this.right);
      this.input_forces.push(dir);
    }
  }

  apply_rotation(resources, parameters) {
    let { dt } = resources;

    let [theta, phi] = this.rotations;
    let front_prime = vec3.zero([]);
    let right_prime = vec3.zero([]);
    let up_prime = vec3.zero([]);

    // rotation around the up vector.
    this.get_vectors();
    vec3.scale(front_prime, this.front, Math.cos(theta * dt));
    vec3.scale(right_prime, this.right, Math.sin(theta * dt));
    vec3.add(front_prime, right_prime, front_prime);
    vec3.copy(this.front, front_prime);
    vec3.copy(this.right, right_prime);

    vec3.add(this.target, this.position, this.front);

    // rotation around the right vector.
    this.get_vectors();
    vec3.scale(front_prime, this.front, Math.cos(phi * dt));
    vec3.scale(up_prime, this.up, Math.sin(phi * dt));
    vec3.add(front_prime, front_prime, up_prime);
    // check to make sure front is not too close to the world_up vector.
    let gimbal_risk = vec3.dot(this.world_up, front_prime);

    if (gimbal_risk < 0.95 && gimbal_risk > -0.95) {
      vec3.copy(this.front, front_prime);
      vec3.copy(this.up, up_prime);
      vec3.add(this.target, this.position, front_prime);
    }
  }

  step(resources, parameters) {
    let { dt } = resources;

    // NOTE(Nic): velocity version, useful for applying forces, but larger error term.
    const new_pos = vec3.zero([]);
    const new_vel = vec3.zero([]);
    const new_acc = vec3.zero([]);
    const new_force = vec3.zero([]);
    const drag_force = vec3.zero([]);
    const target_distance = vec3.sub([], this.target, this.position);

    // position
    vec3.scaleAndAdd(new_pos, this.position, this.velocity, dt);
    vec3.scaleAndAdd(new_pos, new_pos, this.acceleration, dt * dt);

    // acceleration

    if (this.input_forces.length > 0) {
      this.input_forces.forEach((force) => {
        vec3.add(new_force, new_force, force);
      });
      vec3.normalize(new_force, new_force);
      vec3.scale(new_force, new_force, this.force_scale);
    } else {
      vec3.scale(drag_force, vec3.negate([], this.velocity), 7.5);
    }

    // vec3.scale(drag_force, vec3.multiply(drag_force, this.velocity, this.velocity), 0.5 * drag_coeff);
    // vec3.scale(drag_force, drag_force, 1.0 / this.mass);
    vec3.add(new_acc, new_force, drag_force);

    // velocity
    vec3.scaleAndAdd(
      new_vel,
      this.velocity,
      vec3.add([], this.acceleration, new_acc),
      dt * 0.5
    );
    if (vec3.length(new_vel) < this.min_velocity_magnitude) {
      vec3.zero(new_vel);
    }

    this.position = new_pos;
    this.target = vec3.add(this.target, new_pos, target_distance);
    this.velocity = new_vel;
    this.acceleration = new_acc;

    this.input_forces = [];

    // update the points for the cross-section if you want...
    // parameters.p1 = [this.position[0], this.position[2]];
    // parameters.p2 = vec2.normalize([], [this.target[0], this.target[2]]);

    this.apply_rotation(resources, parameters);
  }

  get_vectors() {
    vec3.subtract(this.front, this.target, this.position);
    vec3.normalize(this.front, this.front);

    vec3.cross(this.right, this.front, this.world_up);
    vec3.normalize(this.right, this.right);

    vec3.cross(this.up, this.front, this.right);
    vec3.normalize(this.up, this.up);

    vec3.add(this.target, this.position, this.front);
  }

  get_matrix() {
    this.get_vectors();

    mat4.lookAt(this.V, this.position, this.target, this.up);
    mat4.perspective(
      this.P,
      Math.PI / 4.0,
      window.innerWidth / window.innerHeight,
      0.001,
      100.0
    );

    const PV = mat4.multiply([], this.P, this.V);

    return PV;
  }
}
