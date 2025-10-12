/**
 * Pattern Presets for Game of Life
 * Each pattern is defined as an array of [x, y] coordinates relative to the center
 */

/**
 * Glider - A simple spaceship that moves diagonally
 */
const glider = [
    [0, -1],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
];

/**
 * Blinker - The simplest oscillator (period 2)
 */
const blinker = [
    [-1, 0],
    [0, 0],
    [1, 0],
];

/**
 * Pulsar - A beautiful oscillator with period 3
 */
const pulsar = [
    // Top section
    [-6, -4], [-5, -4], [-4, -4], [-2, -4], [-1, -4], [0, -4],
    [1, -4], [2, -4], [4, -4], [5, -4], [6, -4],
    [-6, -2], [-4, -2], [-2, -2], [2, -2], [4, -2], [6, -2],
    // Middle section
    [-6, -1], [-5, -1], [-4, -1], [-2, -1], [-1, -1], [0, -1],
    [1, -1], [2, -1], [4, -1], [5, -1], [6, -1],
    // Center
    [-6, 1], [-5, 1], [-4, 1], [-2, 1], [-1, 1], [0, 1],
    [1, 1], [2, 1], [4, 1], [5, 1], [6, 1],
    [-6, 2], [-4, 2], [-2, 2], [2, 2], [4, 2], [6, 2],
    // Bottom section
    [-6, 4], [-5, 4], [-4, 4], [-2, 4], [-1, 4], [0, 4],
    [1, 4], [2, 4], [4, 4], [5, 4], [6, 4],
];

/**
 * Gosper Glider Gun - Produces a stream of gliders
 */
const gliderGun = [
    // Left block
    [0, 4], [0, 5], [1, 4], [1, 5],
    // Left section
    [10, 4], [10, 5], [10, 6],
    [11, 3], [11, 7],
    [12, 2], [12, 8],
    [13, 2], [13, 8],
    [14, 5],
    [15, 3], [15, 7],
    [16, 4], [16, 5], [16, 6],
    [17, 5],
    // Right section
    [20, 2], [20, 3], [20, 4],
    [21, 2], [21, 3], [21, 4],
    [22, 1], [22, 5],
    [24, 0], [24, 1], [24, 5], [24, 6],
    // Right block
    [34, 2], [34, 3], [35, 2], [35, 3],
];

/**
 * Lightweight Spaceship (LWSS) - Moves horizontally
 */
const spaceship = [
    [0, 0], [3, 0],
    [4, 1],
    [0, 2], [4, 2],
    [1, 3], [2, 3], [3, 3], [4, 3],
];

/**
 * All available patterns
 */
export const patterns = {
    random: null, // Special case - handled separately
    glider,
    blinker,
    pulsar,
    glidergun: gliderGun,
    spaceship,
    clear: [], // Empty array for clear
};

/**
 * Get pattern coordinates centered on the grid
 * @param {string} patternKey - The pattern identifier
 * @param {number} gridSize - The size of the grid
 * @returns {Array<{x: number, y: number}>} Array of cell coordinates
 */
export const getPatternCells = (patternKey, gridSize) => {
    const pattern = patterns[patternKey];
    
    if (!pattern) return null; // random or unknown
    
    const centerX = Math.floor(gridSize / 2);
    const centerY = Math.floor(gridSize / 2);
    
    return pattern.map(([dx, dy]) => ({
        x: centerX + dx,
        y: centerY + dy,
    })).filter(({ x, y }) => x >= 0 && x < gridSize && y >= 0 && y < gridSize);
};

/**
 * Get pattern bounding box dimensions
 */
const getPatternSize = (pattern) => {
    if (!pattern || pattern.length === 0) return { width: 0, height: 0 };
    
    const xs = pattern.map(([x]) => x);
    const ys = pattern.map(([, y]) => y);
    
    return {
        width: Math.max(...xs) - Math.min(...xs) + 1,
        height: Math.max(...ys) - Math.min(...ys) + 1,
    };
};

/**
 * Get multiple pattern instances distributed across the grid based on density
 * @param {string} patternKey - The pattern identifier
 * @param {number} gridSize - The size of the grid
 * @param {number} density - Density value (0-1) controlling how many patterns to place
 * @returns {Array<{x: number, y: number}>} Array of cell coordinates
 */
export const getPatternCellsWithDensity = (patternKey, gridSize, density) => {
    const pattern = patterns[patternKey];
    
    if (!pattern) return null; // random or unknown
    if (pattern.length === 0) return []; // clear
    
    const { width, height } = getPatternSize(pattern);
    const padding = 3; // Space between patterns
    const cellWidth = width + padding;
    const cellHeight = height + padding;
    
    // Calculate how many patterns can fit
    const maxCols = Math.floor(gridSize / cellWidth);
    const maxRows = Math.floor(gridSize / cellHeight);
    const maxPatterns = maxCols * maxRows;
    
    // Density controls how many patterns to place (at least 1)
    const numPatterns = Math.max(1, Math.round(maxPatterns * density));
    
    // Generate all possible grid positions
    const positions = [];
    for (let row = 0; row < maxRows; row++) {
        for (let col = 0; col < maxCols; col++) {
            const offsetX = Math.floor((gridSize - maxCols * cellWidth) / 2) + col * cellWidth + Math.floor(cellWidth / 2);
            const offsetY = Math.floor((gridSize - maxRows * cellHeight) / 2) + row * cellHeight + Math.floor(cellHeight / 2);
            positions.push({ offsetX, offsetY });
        }
    }
    
    // Shuffle and pick positions based on density
    const shuffled = positions.sort(() => Math.random() - 0.5);
    const selectedPositions = shuffled.slice(0, numPatterns);
    
    // Generate all cells for selected positions
    const cells = [];
    for (const { offsetX, offsetY } of selectedPositions) {
        for (const [dx, dy] of pattern) {
            const x = offsetX + dx;
            const y = offsetY + dy;
            if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
                cells.push({ x, y });
            }
        }
    }
    
    return cells;
};

/**
 * Check if a pattern key is valid
 */
export const isValidPattern = (patternKey) => {
    return patternKey in patterns;
};

/**
 * Get minimum recommended grid size for a pattern
 */
export const getMinGridSize = (patternKey) => {
    const sizes = {
        random: 8,
        glider: 8,
        blinker: 8,
        pulsar: 16,
        glidergun: 40,
        spaceship: 12,
        clear: 8,
    };
    return sizes[patternKey] || 16;
};
