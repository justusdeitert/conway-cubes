/**
 * UI Controls - handles user interface bindings and state
 */

import { $, $$ } from '../utils/dom.js';
import {
    initGrid,
    toggleGrid,
    tickGrid,
    setGridSize,
    setGridDensity,
    setGridDelay,
    setGridRule,
    setGridPattern,
} from '../game/grid.js';
import { toggleAutoRotate } from '../game/renderer.js';

/**
 * UI state and element references
 */
const ui = {
    state: 'stopped',
    controls: {},
};

// Base classes that should always be on body
const bodyBaseClasses = 'm-0 min-h-screen bg-[#0a0a0b] font-orbitron text-sm text-[#a1a1aa] overflow-hidden';

/**
 * Sets the UI state (stopped, running, paused)
 */
const setState = (state) => {
    const { controls } = ui;

    if (state === 'stopped') {
        controls.gridsize.disabled = false;
        controls.density.disabled = false;
        controls.freq.disabled = false;
        controls.start.disabled = false;
        controls.step.disabled = false;
        controls.stop.disabled = true;
    } else if (state === 'running') {
        controls.gridsize.disabled = false;
        controls.density.disabled = true;
        controls.freq.disabled = false;
        controls.start.disabled = false;
        controls.step.disabled = true;
        controls.stop.disabled = false;
    } else if (state === 'paused') {
        controls.step.disabled = false;
    }

    ui.state = state;
    $('body').className = `${bodyBaseClasses} ${state}`;
};

/**
 * Callback handlers for controls
 */
const createCallbacks = (grid) => ({
    start: () => {
        toggleGrid(grid);
        setState(ui.state === 'running' ? 'paused' : 'running');
    },

    step: () => {
        tickGrid(grid);
    },

    stop: () => {
        initGrid(grid, grid.currentPattern || 'random');
        setState('stopped');
    },

    gridsize: (value) => {
        setGridSize(grid, parseInt(value, 10));
        const meter = $('#param-gridsize').parentNode.querySelector('.slider-value');
        meter.textContent = `${value}×${value}`;
    },

    density: (value) => {
        setGridDensity(grid, value / 100);
        const meter = $('#param-density').parentNode.querySelector('.slider-value');
        meter.textContent = `${value}%`;
    },

    freq: (value) => {
        setGridDelay(grid, 1000 / value);
        const meter = $('#param-freq').parentNode.querySelector('.slider-value');
        meter.textContent = `${value} Hz`;
    },

    ruleset: (value) => {
        setGridRule(grid, value);
    },

    rotate: () => {
        const isRotating = toggleAutoRotate();
        const btn = $('#btn-rotate');
        if (isRotating) {
            btn.classList.remove('rotation-paused');
        } else {
            btn.classList.add('rotation-paused');
        }
    },

    pattern: (value) => {
        setGridPattern(grid, value);
        // Update grid size slider if pattern requires larger grid
        const gridSizeInput = $('#param-gridsize');
        if (parseInt(gridSizeInput.value, 10) < grid.size) {
            gridSizeInput.value = grid.size;
            const meter = gridSizeInput.parentNode.querySelector('.slider-value');
            meter.textContent = `${grid.size}×${grid.size}`;
        }
        setState('stopped');
    },
});

/**
 * Sets up keyboard shortcuts
 */
const setupKeyboardShortcuts = (buttonKeycodes, callbacks) => {
    window.addEventListener(
        'keydown',
        (event) => {
            const button = buttonKeycodes[event.keyCode];
            if (button) {
                button.classList.add('down');
                const action = button.dataset.action;
                if (action && callbacks[action]) {
                    callbacks[action]();
                }
            }
        },
        true
    );

    window.addEventListener(
        'keyup',
        (event) => {
            const button = buttonKeycodes[event.keyCode];
            if (button) {
                button.classList.remove('down');
            }
        },
        true
    );
};

/**
 * Binds action elements to their handlers
 */
const bindActions = (callbacks) => {
    const buttonKeycodes = {};

    $$('[data-action]').forEach((element) => {
        const action = element.dataset.action;
        const keycode = element.dataset.keycode;

        if (keycode) {
            buttonKeycodes[keycode] = element;
        }

        const tagName = element.tagName.toLowerCase();

        if (tagName === 'button') {
            element.addEventListener('click', () => {
                if (callbacks[action]) callbacks[action]();
            });
        } else if (tagName === 'input' || tagName === 'select') {
            element.addEventListener('change', (event) => {
                if (callbacks[action]) callbacks[action](event.target.value);
            });
        }
    });

    return buttonKeycodes;
};

/**
 * Initializes the UI controls
 */
export const initControls = (grid) => {
    // Cache control references
    ui.controls = {
        gridsize: $('#param-gridsize'),
        density: $('#param-density'),
        freq: $('#param-freq'),
        start: $('#btn-start'),
        step: $('#btn-step'),
        stop: $('#btn-stop'),
    };

    const callbacks = createCallbacks(grid);
    const buttonKeycodes = bindActions(callbacks);
    setupKeyboardShortcuts(buttonKeycodes, callbacks);

    setState('stopped');
};
