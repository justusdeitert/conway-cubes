/**
 * Grid - functional approach for Game of Life grid
 */

import { $, createElement } from '../utils/dom.js';
import {
    createCell,
    evolveCell,
    tickCell,
    renderCell,
    unrenderCell,
    setRule,
} from './cell.js';

/**
 * Sets the rule set for the simulation
 */
export const setGridRule = (grid, ruleKey) => {
    setRule(ruleKey);
};

/**
 * Creates a grid state object
 */
export const createGrid = (size = 20, density = 0.1, delay = 500) => ({
    size,
    density,
    delay,
    cells: [],
    tickCounter: 0,
    tickTimer: null,
    ticking: false,
    delayChanged: false,
    node: null,
});

/**
 * Seeds the grid with cells
 */
export const seedGrid = (grid) => {
    grid.cells = [];
    for (let x = 0; x < grid.size; x++) {
        for (let y = 0; y < grid.size; y++) {
            const alive = Math.random() < grid.density;
            grid.cells.push(createCell(x, y, alive));
        }
    }
};

/**
 * Builds neighbor cache for all cells (wrapping at edges)
 */
export const buildNeighborCache = (grid) => {
    const maxIndex = grid.size * grid.size - 1;

    grid.cells.forEach((cell, i) => {
        const neighborOffsets = [
            -1,
            1,
            -1 - grid.size,
            -grid.size,
            1 - grid.size,
            -1 + grid.size,
            grid.size,
            1 + grid.size,
        ];

        cell.neighbors = neighborOffsets.map((offset) => {
            let ni = i + offset;
            if (ni < 0) ni += maxIndex + 1;
            else if (ni > maxIndex) ni -= maxIndex + 1;
            return grid.cells[ni];
        });
    });
};

/**
 * Renders the grid to the DOM
 */
export const renderGrid = (grid) => {
    if (!grid.node) {
        grid.node = createElement('div', 'grid');
        document.getElementById('viewport').appendChild(grid.node);
    }

    $('#cyclecount').textContent = grid.tickCounter;

    grid.cells.forEach((cell) => renderCell(cell, grid.node));

    const cellSize = grid.cells[0].node.offsetWidth + 2;
    grid.node.style.width = `${cellSize * grid.size}px`;
    grid.node.style.height = `${cellSize * grid.size}px`;
    grid.node.parentNode.style.top = `${(window.innerHeight - cellSize * grid.size) / 2 - 50}px`;
};

/**
 * Performs one tick of the simulation
 */
export const tickGrid = (grid) => {
    // First pass: determine next state
    grid.cells.forEach(evolveCell);

    // Second pass: apply state changes
    grid.cells.forEach(tickCell);

    grid.tickCounter++;
    renderGrid(grid);
};

/**
 * Initializes/resets the grid
 */
export const initGrid = (grid) => {
    clearInterval(grid.tickTimer);

    grid.cells.forEach(unrenderCell);
    grid.cells = [];
    grid.tickCounter = 0;
    grid.tickTimer = null;
    grid.ticking = false;

    seedGrid(grid);
    buildNeighborCache(grid);
    renderGrid(grid);
};

/**
 * Starts the tick timer
 */
const initTimer = (grid) => {
    clearInterval(grid.tickTimer);
    grid.tickTimer = setInterval(() => tickGrid(grid), grid.delay);
};

/**
 * Starts the simulation
 */
export const startGrid = (grid) => {
    if (grid.ticking) return;

    grid.node.classList.add('ticking');
    tickGrid(grid);
    initTimer(grid);
    grid.ticking = true;
};

/**
 * Stops/pauses the simulation
 */
export const stopGrid = (grid) => {
    grid.node.classList.remove('ticking');
    clearInterval(grid.tickTimer);
    grid.ticking = false;
};

/**
 * Toggles between start and pause
 */
export const toggleGrid = (grid) => {
    if (grid.ticking) {
        stopGrid(grid);
    } else {
        startGrid(grid);
    }
};

/**
 * Sets the tick delay (speed)
 */
export const setGridDelay = (grid, delay) => {
    grid.delay = delay;
    if (grid.ticking) {
        initTimer(grid);
    }
};

/**
 * Sets grid size and reinitializes
 */
export const setGridSize = (grid, size) => {
    grid.size = size;
    initGrid(grid);
};

/**
 * Sets density and reinitializes
 */
export const setGridDensity = (grid, density) => {
    grid.density = density;
    initGrid(grid);
};
