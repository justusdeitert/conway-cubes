/**
 * Grid - functional approach for Game of Life grid
 * Now using Three.js for rendering
 */

import { $ } from '../utils/dom.js';
import {
    createCell,
    evolveCell,
    tickCell,
    setRule,
    toggleCell,
    activateCell,
} from './cell.js';
import {
    initRenderer,
    createGridMesh,
    updateCells,
    getCellAtPosition as getRendererCellAtPosition,
    disableControls,
    enableControls,
} from './renderer.js';
import { getPatternCells, getPatternCellsWithDensity, getMinGridSize } from './patterns.js';

// Drawing state
let isDrawing = false;
let lastActivatedCell = null;
let rendererInitialized = false;

/**
 * Sets up grid-level mouse event handlers for drawing
 */
const setupGridDrawing = (grid, container) => {
    // Mousedown: start drawing and activate cell
    container.addEventListener('mousedown', (event) => {
        // Don't interfere with orbit controls
        if (event.button !== 0) return;

        const cell = getRendererCellAtPosition(event, grid.cells);
        if (cell) {
            event.preventDefault();
            event.stopPropagation();
            disableControls(); // Disable orbit controls while drawing
            isDrawing = true;
            toggleCell(cell);
            updateCells(grid.cells);
            lastActivatedCell = cell;
        }
    });

    // Mousemove: continue drawing while held
    container.addEventListener('mousemove', (event) => {
        if (!isDrawing) return;
        const cell = getRendererCellAtPosition(event, grid.cells);
        if (cell && cell !== lastActivatedCell) {
            activateCell(cell);
            updateCells(grid.cells);
            lastActivatedCell = cell;
        }
    });

    // Mouseup: stop drawing
    window.addEventListener('mouseup', () => {
        if (isDrawing) {
            enableControls(); // Re-enable orbit controls after drawing
        }
        isDrawing = false;
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
export const createGrid = (size = 32, density = 0.1, delay = 500) => ({
    size,
    density,
    delay,
    cells: [],
    tickCounter: 0,
    tickTimer: null,
    ticking: false,
    delayChanged: false,
    currentPattern: 'random',
});

/**
 * Seeds the grid with cells
 * @param {Object} grid - The grid object
 * @param {string} pattern - Pattern key ('random', 'glider', etc.)
 */
export const seedGrid = (grid, pattern = 'random') => {
    grid.cells = [];
    
    // Use density-based placement for patterns
    const patternCells = getPatternCellsWithDensity(pattern, grid.size, grid.density);
    const patternSet = patternCells 
        ? new Set(patternCells.map(({ x, y }) => `${x},${y}`))
        : null;
    
    for (let x = 0; x < grid.size; x++) {
        for (let y = 0; y < grid.size; y++) {
            let alive = false;
            
            if (patternSet) {
                // Use pattern cells
                alive = patternSet.has(`${x},${y}`);
            } else {
                // Random mode
                alive = Math.random() < grid.density;
            }
            
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
 * Renders the grid using Three.js
 */
export const renderGrid = (grid) => {
    $('#cyclecount').textContent = grid.tickCounter;
    updateCells(grid.cells);
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
 * @param {Object} grid - The grid object
 * @param {string} pattern - Pattern key ('random', 'glider', etc.)
 */
export const initGrid = (grid, pattern = 'random') => {
    clearInterval(grid.tickTimer);

    grid.cells = [];
    grid.tickCounter = 0;
    grid.tickTimer = null;
    grid.ticking = false;
    grid.currentPattern = pattern;

    // Initialize Three.js renderer if not done
    if (!rendererInitialized) {
        const viewport = document.getElementById('viewport');
        initRenderer(viewport);
        setupGridDrawing(grid, viewport);
        rendererInitialized = true;
    }

    // Create/update the grid mesh
    createGridMesh(grid.size);

    seedGrid(grid, pattern);
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

    initTimer(grid);
    grid.ticking = true;
};

/**
 * Stops/pauses the simulation
 */
export const stopGrid = (grid) => {
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
 * Sets grid size while preserving existing cells (centered)
 */
export const setGridSize = (grid, size) => {
    const oldSize = grid.size;
    const oldCells = grid.cells;
    const wasTicking = grid.ticking;

    // Temporarily stop if running
    if (wasTicking) {
        clearInterval(grid.tickTimer);
    }

    // Update size
    grid.size = size;

    // Calculate offset to keep content centered
    const offset = Math.floor((size - oldSize) / 2);

    // Create new cells array, preserving state from old cells (centered)
    grid.cells = [];
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            let alive = false;
            // Map new position back to old grid position (centered)
            const oldX = x - offset;
            const oldY = y - offset;

            // Check if this position existed in old grid
            if (oldX >= 0 && oldX < oldSize && oldY >= 0 && oldY < oldSize) {
                const oldIndex = oldX * oldSize + oldY;
                alive = oldCells[oldIndex]?.alive || false;
            } else {
                // New cells get random state based on density
                alive = Math.random() < grid.density;
            }
            grid.cells.push(createCell(x, y, alive));
        }
    }

    // Update Three.js mesh
    createGridMesh(size);

    // Rebuild neighbor cache and render
    buildNeighborCache(grid);
    renderGrid(grid);

    // Resume if was running
    if (wasTicking) {
        grid.tickTimer = setInterval(() => tickGrid(grid), grid.delay);
    }
};

/**
 * Sets density and reinitializes
 */
export const setGridDensity = (grid, density) => {
    grid.density = density;
    initGrid(grid, grid.currentPattern || 'random');
};

/**
 * Sets the pattern and reinitializes the grid
 */
export const setGridPattern = (grid, pattern) => {
    // Auto-adjust grid size for large patterns
    const minSize = getMinGridSize(pattern);
    if (grid.size < minSize) {
        grid.size = minSize;
    }
    initGrid(grid, pattern);
};
