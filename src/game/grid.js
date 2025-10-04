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
    toggleCell,
    activateCell,
} from './cell.js';

// Drawing state
let isDrawing = false;
let lastActivatedCell = null;

/**
 * Gets cell at mouse position - tries exact hit first, then finds nearest cell
 */
const getCellAtPosition = (grid, e) => {
    // First try: exact hit using elementsFromPoint (handles 3D transforms)
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    
    for (const el of elements) {
        if (el.classList.contains('cell')) {
            return grid.cells.find(cell => cell.node === el) || null;
        }
    }
    
    // Second try: find nearest cell (for gaps)
    let nearestCell = null;
    let nearestDist = Infinity;
    
    for (const cell of grid.cells) {
        if (!cell.node) continue;
        const rect = cell.node.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
        
        // Only consider cells within reasonable distance (half cell size + gap)
        if (dist < nearestDist && dist < rect.width) {
            nearestDist = dist;
            nearestCell = cell;
        }
    }
    
    return nearestCell;
};

/**
 * Sets up grid-level mouse event handlers for drawing
 */
const setupGridDrawing = (grid) => {
    // Mousedown: start drawing and activate cell
    grid.node.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDrawing = true;
        const cell = getCellAtPosition(grid, e);
        if (cell) {
            toggleCell(cell);
            renderCell(cell, grid.node);
            lastActivatedCell = cell;
        }
    });
    
    // Mousemove: continue drawing while held
    grid.node.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const cell = getCellAtPosition(grid, e);
        if (cell && cell !== lastActivatedCell) {
            activateCell(cell);
            renderCell(cell, grid.node);
            lastActivatedCell = cell;
        }
    });
    
    // Mouseup: stop drawing
    window.addEventListener('mouseup', () => {
        isDrawing = false;
        lastActivatedCell = null;
    });
    
    // Mouseleave: stop drawing when leaving grid
    grid.node.addEventListener('mouseleave', () => {
        lastActivatedCell = null;
    });
};

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
 * Builds neighbor cache for all cells (bounded at edges)
 */
export const buildNeighborCache = (grid) => {
    const size = grid.size;

    grid.cells.forEach((cell, index) => {
        const row = Math.floor(index / size);
        const col = index % size;

        // 8 neighbor directions: [rowOffset, colOffset]
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],          [0, 1],
            [1, -1],  [1, 0],  [1, 1],
        ];

        cell.neighbors = directions
            .map(([rowOffset, colOffset]) => {
                const neighborRow = row + rowOffset;
                const neighborCol = col + colOffset;
                // Only include neighbors within grid boundaries
                if (neighborRow >= 0 && neighborRow < size && neighborCol >= 0 && neighborCol < size) {
                    return grid.cells[neighborRow * size + neighborCol];
                }
                return null;
            })
            .filter(Boolean);
    });
};

/**
 * Renders the grid to the DOM
 */
export const renderGrid = (grid) => {
    if (!grid.node) {
        grid.node = createElement('div', 'grid');
        document.getElementById('viewport').appendChild(grid.node);
        setupGridDrawing(grid);
    }

    $('#cyclecount').textContent = grid.tickCounter;

    grid.cells.forEach((cell) => renderCell(cell, grid.node));

    // Cell has margin: 2px on all sides, so total cell size = width + 4 (2px left + 2px right)
    const cellSize = grid.cells[0].node.offsetWidth + 4;
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
