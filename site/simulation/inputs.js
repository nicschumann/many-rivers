const ButtonStateEnum = {
    UP:             0b00, // 0
    DOWN:           0b01, // 1
    HANDLED:        0b10, // 2
    DOWN_HANDLED:   0b11, // 3
};

const InputTypeEnum = {
    MOUSE: "mouse",
    KEYS: "keys",
}

const INITIALIZED = 'initialized';
const MOUSE_DELTA = 'mouse_delta'
const MOUSE_POS = 'mouse_pos'
const POINTER_LOCK = 'pointer_lock'

const input_state = {
    [INITIALIZED]: false,
    [POINTER_LOCK]: false,
    [MOUSE_DELTA]: [0, 0],
    [MOUSE_POS]: [0, 0],
    [InputTypeEnum.MOUSE]: {}, // int => bool
    [InputTypeEnum.KEYS]: {}, // str => bool
};

const get_input_state = (type, selector) => {
    const s = input_state[type][selector];
    return (typeof s !== "undefined") ? s : ButtonStateEnum.UP;
}

const set_input_state = (type, selector, v) => {
    input_state[type][selector] = v;
}

const set_input_down_bit = (type, selector) => {
    set_input_state(type, selector, ButtonStateEnum.DOWN); 
}

const reset_input_down_bit = (type, selector) => {
    const s = get_input_state(type, selector);
    set_input_state(type, selector, s & 0b10); 
}

/**
 * Return true if the button is 
 * 
 * @param {InputType} type 
 * @param {string} selector 
 * @returns {boolean} 
 */
// (InputType x string) -> boolean
const is_down = (type, selector) => {
    return !! ( get_input_state(type, selector) & 0b01 )
}

// (InputType x string) -> boolean
const is_handled = (type, selector) => {
    return !! ( get_input_state(type, selector) & 0b10 )
}

const set_handled = (type, selector) => {
    let s = get_input_state(type, selector) | 0b10;
    set_input_state(type, selector, s);
}


// --- logical public interface --
// --- mouse ---

/**
 * Check whether the mouse is down right now.
 * 
 * @param {number?} selector the index of the mouse button we want to check the state of
 * @returns {boolean} true if the mouse is currently down, false otherwise.
 */
export const mouse_is_down = (selector = 0) => {
    return is_down(InputTypeEnum.MOUSE, selector);
}

/**
 * Check whether the current mouse button press has been "handled".
 * Used for debouncing mouse actions, if you want.
 * 
 * @param {number?} selector the index of the mouse button we want to check the state of
 * @returns {boolean} true if the last mouse action has been handled or not.
 */
export const mouse_is_handled = (selector = 0) => {
    return is_handled(InputTypeEnum.MOUSE, selector);
}

/**
 * Set that the current mouse-press has been handled.
 * 
 * @param {number} selector the index of the mouse button we want to set
 */
export const set_mouse_handled = (selector = 0) => {
    set_handled(InputTypeEnum.MOUSE, selector);
}

// --- keys ---
/**
 * Check whether a given key is down right now.
 * 
 * @param {string} selector the name of the key we want to check the state of
 * @returns {boolean} true if the key is currently down, false otherwise.
 */
export const key_is_down = (selector) => {
    return is_down(InputTypeEnum.KEYS, selector);
}

/**
 * Check whether a given key has been handled or not.
 * 
 * @param {string} selector the name of the key we want to check the state of
 * @returns {boolean} true if the key is currently down, false otherwise.
 */
export const key_is_handled = (selector) => {
    return is_handled(InputTypeEnum.KEYS, selector);
}

/**
 * Set that the given keystrone has been handled.
 * 
 * @param {string} selector the name of the key we want to set
 */
export const set_key_handled = (selector) => {
    set_handled(InputTypeEnum.KEYS, selector);
}

// --- mouse movement ---
/**
 * @returns {[number, number]} get the current position of the mouse.
 */
export const mouse_pos = () => {
    return input_state[MOUSE_POS];
}

/**
 * Get the current accumumated delta of the mouse since the last time 
 * it was reset.
 * 
 * @returns {[number, number]} the current x and y delta of the mouse
 */
export const mouse_delta = () => {
    return input_state[MOUSE_DELTA];
}

/**
 * Set the current mouse delta to [0,0]. Useful after you're done
 * handling a mouse_delta.
 */
export const reset_mouse_delta = () => {
    input_state[MOUSE_DELTA] = [0, 0];
}

/**
 * @returns {boolean} true if the pointer is currently locked.
 */
export const pointer_is_locked = () => {
    return document.pointerLockElement !== null
}


export const setup_input_handlers = (window, pointer_lock_key = 'Enter') => {
    if (input_state[INITIALIZED]) { return; }

    window.addEventListener('mousedown', e => {
        const type = InputTypeEnum.MOUSE;
        const selection = e.button;
        set_input_down_bit(type, selection);
    })

    window.addEventListener('mousemove', e => {
        let [dx, dy] = [e.movementX, e.movementY]
        let [mx, my] = [e.clientX, e.clientY]

        input_state[MOUSE_DELTA] = [dx, dy]
        input_state[MOUSE_POS] = [mx, my]
    })

    window.addEventListener('mouseup', e => {
        const type = InputTypeEnum.MOUSE;
        const selection = e.button;
        reset_input_down_bit(type, selection)
    })

    window.addEventListener('keydown', e => {
        

        const type = InputTypeEnum.KEYS;
        const selection = e.key;
        set_input_down_bit(type, selection);
    })

    window.addEventListener('keyup', e => {
        const type = InputTypeEnum.KEYS;
        const selection = e.key;
        reset_input_down_bit(type, selection);
    })

    // let button = document.getElementById('pointer-toggle');

    // let c = document.getElementsByTagName('canvas');
    // if (c.length !== 1) { throw new Error(`PointerLock: Didn't find the right number of canvases: found ${c.length}, needed 1.`) }
    // c = c[0];

    // button.addEventListener('click', e => {
    //     if (pointer_is_locked()) { document.exitPointerLock(); }
    //     else { c.requestPointerLock(); }
    //     // should only be one canvas on the page...
    // })

    input_state[INITIALIZED] = true;
};