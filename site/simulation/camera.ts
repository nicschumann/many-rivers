import { vec2, vec3, mat4 } from "gl-matrix";
import { cartesian_to_spherical, spherical_to_cartesian } from "./transforms";
import { InputAPI } from "./inputs";
import { RenderResources } from "./context";

const POS_DEBUG = (
  position: [number, number, number],
  target: [number, number, number]
): void => {
  console.log(`pos: ${position.map((x) => x.toFixed(3))}`);
  console.log(`tar: ${target.map((x) => x.toFixed(3))}`);

  const spherical = cartesian_to_spherical(position, target);
  console.log(`sphr: ${spherical.map((x) => x.toFixed(3))}`);
  const cartesian = spherical_to_cartesian(spherical, target);

  console.log(`cart: ${cartesian.map((x) => x.toFixed(3))}\n\n`);
};

class CameraAnimation {
  interruptable: boolean = false;
  start_time: number | null = null;
  start: { position: vec3; target: vec3 };
  end: { position: vec3; target: vec3 };
  duration: number;
  t: number;

  constructor() {
    this.start = {
      position: vec3.fromValues(0, 0, 0),
      target: vec3.fromValues(0, 0, 0),
    };

    this.end = {
      position: vec3.fromValues(0, 0, 0),
      target: vec3.fromValues(0, 0, 0),
    };

    this.duration = 1; // seconds
    this.t = 0;
  }

  set_start(position: vec3, target: vec3): CameraAnimation {
    this.start.position = position;
    this.start.target = target;

    return this;
  }

  set_end(position: vec3, target: vec3): CameraAnimation {
    this.end.position = position;
    this.end.target = target;

    return this;
  }

  step(resources: RenderResources): { position: vec3; target: vec3 } {
    if (this.t >= this.duration) {
      return {
        position: this.end.position,
        target: this.end.target,
      };
    }

    const { dt } = resources;
    this.t += dt;
    this.t = Math.min(this.duration, this.t);

    // normalized animation curve...
    const alpha = this.t / this.duration;

    const position = vec3.fromValues(
      this.start.position[0] * (1 - alpha) + this.end.position[0] * alpha,
      this.start.position[1] * (1 - alpha) + this.end.position[1] * alpha,
      this.start.position[2] * (1 - alpha) + this.end.position[2] * alpha
    );

    const target = vec3.fromValues(
      this.start.target[0] * (1 - alpha) + this.end.target[0] * alpha,
      this.start.target[1] * (1 - alpha) + this.end.target[1] * alpha,
      this.start.target[2] * (1 - alpha) + this.end.target[2] * alpha
    );

    return {
      position,
      target,
    };
  }
}

export class Camera {
  animation: CameraAnimation | null = null;
  world_up: vec3 = [0, -1, 0];
  min_velocity_magnitude = 0.0001;
  sensitivity = 7;
  drag = 1.0;
  mass = 1.0;
  force_scale = 0.5;
  drag_scale = 7.5;

  mouse_pos: [number, number] = [0, 0];
  last_mouse_pos: [number, number] = [0, 0];
  rotations: [number, number] = [0, 0]; // theta, phi | rotation around up, rotation around right.

  input_forces: vec3[] = [];
  acceleration: vec3 = [0, 0, 0];
  velocity: vec3 = [0, 0, 0];
  position: vec3;

  target_forces: vec3[] = [];
  target_acceleration: vec3 = [0, 0, 0];
  target_velocity: vec3 = [0, 0, 0];
  target: vec3;

  // camera vectors
  front: vec3 = [0, 0, 0];
  right: vec3 = [0, 0, 0];
  up: vec3 = [0, 0, 0];

  // camera matrices
  V: mat4 = mat4.identity([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  P: mat4 = mat4.identity([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  constructor(position: vec3, target: vec3) {
    this.position = position;
    this.target = target;
  }

  handle_input(input: InputAPI) {
    this.get_vectors();

    this.last_mouse_pos = this.mouse_pos;
    this.mouse_pos = input.mouse_pos();

    if (input.pointer_is_locked()) {
      let [dx, dy] = input.mouse_delta();
      let theta = (-this.sensitivity * dx * Math.PI) / 180.0;
      let phi = (-this.sensitivity * dy * Math.PI) / 180.0;

      this.rotations = [theta, phi];
      input.reset_mouse_delta();
    } else {
      this.rotations = [0, 0];
    }

    if (input.key_is_down("w")) {
      // POS_DEBUG(this.position, this.target);
      let dir = this.front;
      this.input_forces.push(dir);
      this.target_forces.push(dir);
    }

    if (input.key_is_down("s")) {
      // POS_DEBUG(this.position, this.target);

      let dir = vec3.negate([0, 0, 0], this.front);
      this.input_forces.push(dir);
      this.target_forces.push(dir);
    }

    if (input.key_is_down("a")) {
      let dir = this.right;
      this.input_forces.push(dir);
      this.target_forces.push(dir);
    }

    if (input.key_is_down("d")) {
      let dir = vec3.negate([0, 0, 0], this.right);
      this.input_forces.push(dir);
      this.target_forces.push(dir);
    }
  }

  apply_rotation(resources: RenderResources) {
    /**
     * TODO(Nic): In order to get this to feel truly natural,
     * we need to integrate this the same way we do with the positions.
     * That will be kinda annoying, but not terrible. we can do this by
     * tracking acceleration and velocity on theta and phi.
     */
    let { dt } = resources;

    let [theta, phi] = this.rotations;

    let front_prime = vec3.zero([0, 0, 0]);
    let right_prime = vec3.zero([0, 0, 0]);
    let up_prime = vec3.zero([0, 0, 0]);

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
    // if not, apply the rotation
    let gimbal_risk = vec3.dot(this.world_up, front_prime);

    if (gimbal_risk < 0.95 && gimbal_risk > -0.95) {
      vec3.copy(this.front, front_prime);
      vec3.copy(this.up, up_prime);
      vec3.add(this.target, this.position, front_prime);
    }
  }

  step_target(resources: RenderResources) {
    const [new_pos, new_vel, new_acc] = this.apply_forces(
      this.target,
      this.target_velocity,
      this.target_acceleration,
      this.target_forces,
      resources.dt
    );

    this.target = new_pos;
    this.target_velocity = new_vel;
    this.target_acceleration = new_acc;
    this.target_forces = [];
  }

  step_position(resources: RenderResources) {
    const [new_pos, new_vel, new_acc] = this.apply_forces(
      this.position,
      this.velocity,
      this.acceleration,
      this.input_forces,
      resources.dt
    );

    this.position = new_pos;
    this.velocity = new_vel;
    this.acceleration = new_acc;
    this.input_forces = [];
  }

  step(resources: RenderResources) {
    if (this.animation !== null) {
      const { position, target } = this.animation.step(resources);
      vec3.copy(this.position, position);
      vec3.copy(this.target, target);

      if (this.animation.t >= this.animation.duration) {
        // we're done with the animation...
        this.animation = null;
      }
    } else {
      this.step_position(resources);
      this.step_target(resources);
      this.apply_rotation(resources);
    }
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

  set_random_spherical_position() {
    // NOTE(Nic): These are calibrated to do a reasonable
    // random thing, we can customize these to each location, too.
    const r = Math.random() * 0.2 + 0.75;
    const theta = Math.random() * 0.5 + 0.75;
    const phi = Math.random() * 2.0 * Math.PI;

    const pos = spherical_to_cartesian(
      [r, theta, phi],
      this.target as [number, number, number]
    );

    this.position = pos;
    this.get_vectors();
  }

  has_active_animation() {
    return this.animation !== null;
  }

  transition_to_perspective_view() {
    if (this.has_active_animation()) {
      // can't animate if we're already animating...
      return;
    }

    const animation = new CameraAnimation();

    animation.set_end(
      vec3.fromValues(-0.016, 0.431, 0.007),
      vec3.fromValues(0.571, -0.13, 0.588)
    );

    animation.set_start(
      // @ts-ignore
      vec3.copy([], this.position),
      // @ts-ignore
      vec3.copy([], this.target)
    );

    this.animation = animation;
  }

  transition_to_top_view() {
    if (this.has_active_animation()) {
      // can't animate if we're already animating...
      return;
    }

    const animation = new CameraAnimation();

    animation.set_end(
      vec3.fromValues(-0.439, 1.48, 0.447),
      vec3.fromValues(0.098, 0.636, 0.444)
    );

    animation.set_start(
      // @ts-ignore
      vec3.copy([], this.position),
      // @ts-ignore
      vec3.copy([], this.target)
    );

    this.animation = animation;
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

    const PV = mat4.multiply(
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      this.P,
      this.V
    );

    return PV;
  }

  apply_forces(
    pos: vec3,
    vel: vec3,
    acc: vec3,
    inputs: vec3[],
    dt: number
  ): [vec3, vec3, vec3] {
    // NOTE(Nic): velocity version, useful for applying forces, but larger error term.

    const new_pos = vec3.zero([0, 0, 0]);
    const new_vel = vec3.zero([0, 0, 0]);
    const new_acc = vec3.zero([0, 0, 0]);
    const new_force = vec3.zero([0, 0, 0]);
    const drag_force = vec3.zero([0, 0, 0]);

    // update position
    vec3.scaleAndAdd(new_pos, pos, vel, dt);
    vec3.scaleAndAdd(new_pos, new_pos, acc, dt * dt);

    // update acceleration
    if (inputs.length > 0) {
      inputs.forEach((force) => {
        vec3.add(new_force, new_force, force);
      });

      // vec3.normalize(new_force, new_force);
      // vec3.scale(new_force, new_force, this.force_scale);
    } else {
      vec3.scale(drag_force, vec3.negate([0, 0, 0], vel), this.drag_scale);
    }

    vec3.add(new_acc, new_force, drag_force);

    // update velocity
    vec3.scaleAndAdd(new_vel, vel, vec3.add([0, 0, 0], acc, new_acc), dt * 0.5);

    if (vec3.length(new_vel) < this.min_velocity_magnitude) {
      vec3.zero(new_vel);
    }

    return [new_pos, new_vel, new_acc];
  }
}
