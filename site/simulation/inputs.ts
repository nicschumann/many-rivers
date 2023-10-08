export enum InputType {
  Mouse = 0,
  Keys = 1,
}

export enum InputState {
  UP = 0b00,
  DOWN = 0b01,
  HANDLED = 0b10,
  DOWN_HANDLED = 0b11,
}

export class InputAPI {
  private window: Window;
  private initialized: boolean = false;
  private pointer_lock: boolean = false;

  private p_mouse_pos: [number, number] = [0, 0];
  private p_mouse_delta: [number, number] = [0, 0];

  private mouse_state: { [button: number]: InputState } = {};
  private key_state: { [keyname: string]: InputState } = {};

  constructor(window: Window) {
    this.window = window;
  }

  private mousedown_handler = (e: MouseEvent) => {
    this.mouse_state[e.button] = InputState.DOWN;
  };

  private mousemove_handler = (e: MouseEvent) => {
    let [dx, dy] = [e.movementX, e.movementY];
    let [mx, my] = [e.clientX, e.clientY];

    this.p_mouse_delta = [dx, dy];
    this.p_mouse_pos = [mx, my];
  };

  private mouseup_handler = (e: MouseEvent) => {
    const s = this.mouse_state[e.button];
    const s_prime = s & (0b10 as InputState);

    this.mouse_state[e.button] = s_prime;
  };

  private keydown_handler = (e: KeyboardEvent) => {
    this.key_state[e.key] = InputState.DOWN;
  };

  private keyup_handler = (e: KeyboardEvent) => {
    const s = this.key_state[e.key];
    const s_prime = s & (0b10 as InputState);

    this.key_state[e.key] = s_prime;
  };

  init() {
    this.window.addEventListener("mousedown", this.mousedown_handler);
    this.window.addEventListener("mousemove", this.mousemove_handler);
    this.window.addEventListener("mouseup", this.mouseup_handler);
    this.window.addEventListener("keydown", this.keydown_handler);
    this.window.addEventListener("keyup", this.keyup_handler);
  }

  deinit() {
    this.window.removeEventListener("mousedown", this.mousedown_handler);
    this.window.removeEventListener("mousemove", this.mousemove_handler);
    this.window.removeEventListener("mouseup", this.mouseup_handler);
    this.window.removeEventListener("keydown", this.keydown_handler);
    this.window.removeEventListener("keyup", this.keyup_handler);
  }

  mouse_is_down(selector: number): boolean {
    return !!(this.mouse_state[selector] & 0b01);
  }

  mouse_is_handled(selector: number): boolean {
    return !!(this.mouse_state[selector] & 0b10);
  }

  set_mouse_handled(selector: number): void {
    const s = this.mouse_state[selector] || InputState.UP;
    const s_prime = s | (0b10 as InputState);

    this.mouse_state[selector] = s_prime;
  }

  key_is_down(selector: string): boolean {
    return !!(this.key_state[selector] & 0b01);
  }

  key_is_handled(selector: string): boolean {
    return !!(this.key_state[selector] & 0b10);
  }

  set_key_handled(selector: string): void {
    const s = this.key_state[selector] || InputState.UP;
    const s_prime = s | (0b10 as InputState);

    this.key_state[selector] = s_prime;
  }

  mouse_pos(): [number, number] {
    return this.p_mouse_pos;
  }

  mouse_delta(): [number, number] {
    return this.p_mouse_delta;
  }

  reset_mouse_delta(): void {
    this.p_mouse_delta = [0, 0];
  }

  pointer_is_locked(): boolean {
    return document.pointerLockElement !== null;
  }
}
