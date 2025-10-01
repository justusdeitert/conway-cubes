/**
 * Cell - functional approach for Game of Life cells
 */

/**
 * Rule sets for cellular automata
 * Format: { birth: [neighbor counts for birth], survive: [neighbor counts for survival] }
 */
export const RULE_SETS = {
    conway: {
        name: "Conway's Life",
        description: 'B3/S23 - The classic Game of Life',
        birth: [3],
        survive: [2, 3],
    },
    highlife: {
        name: 'HighLife',
        description: 'B36/S23 - Creates replicator patterns',
        birth: [3, 6],
        survive: [2, 3],
    },
    daynight: {
        name: 'Day & Night',
        description: 'B3678/S34678 - Symmetric, chaotic patterns',
        birth: [3, 6, 7, 8],
        survive: [3, 4, 6, 7, 8],
    },
    seeds: {
        name: 'Seeds',
        description: 'B2/S - Explosive growth, cells die immediately',
        birth: [2],
        survive: [],
    },
    diamoeba: {
        name: 'Diamoeba',
        description: 'B35678/S5678 - Diamond-shaped crystalline forms',
        birth: [3, 5, 6, 7, 8],
        survive: [5, 6, 7, 8],
    },
    twobytwo: {
        name: '2x2',
        description: 'B36/S125 - Blocky 2x2 structures',
        birth: [3, 6],
        survive: [1, 2, 5],
    },
    maze: {
        name: 'Maze',
        description: 'B3/S12345 - Creates labyrinth corridors',
        birth: [3],
        survive: [1, 2, 3, 4, 5],
    },
    coral: {
        name: 'Coral',
        description: 'B3/S45678 - Organic coral-like growth',
        birth: [3],
        survive: [4, 5, 6, 7, 8],
    },
};

// Current active rule set
let currentRule = 'conway';

/**
 * Sets the current rule set
 */
export const setRule = (ruleKey) => {
    if (RULE_SETS[ruleKey]) {
        currentRule = ruleKey;
    }
};

/**
 * Gets the current rule set key
 */
export const getRule = () => currentRule;

/**
 * Creates a cell state object
 */
export const createCell = (x, y, alive = false) => ({
    x,
    y,
    alive,
    willDie: false,
    neighbors: [],
    node: null,
});

/**
 * Counts alive neighbors for a cell
 */
export const countAliveNeighbors = (cell) =>
    cell.neighbors.reduce((count, neighbor) => count + (neighbor.alive ? 1 : 0), 0);

/**
 * Determines if a cell should die based on current rule set
 */
export const shouldDie = (cell) => {
    const aliveNeighbors = countAliveNeighbors(cell);
    const rules = RULE_SETS[currentRule];

    // Alive cell survives if neighbor count is in survive array
    if (cell.alive && rules.survive.includes(aliveNeighbors)) {
        return false;
    }

    // Dead cell becomes alive if neighbor count is in birth array
    if (!cell.alive && rules.birth.includes(aliveNeighbors)) {
        return false;
    }

    return true;
};

/**
 * Marks the cell's next state (evolve phase)
 */
export const evolveCell = (cell) => {
    cell.willDie = shouldDie(cell);
};

/**
 * Applies the evolution (tick phase)
 */
export const tickCell = (cell) => {
    cell.alive = !cell.willDie;
};

/**
 * Toggles cell state (for click interaction)
 */
export const toggleCell = (cell) => {
    cell.alive = !cell.alive;
};

/**
 * Sets cell to alive (for drawing)
 */
export const activateCell = (cell) => {
    cell.alive = true;
};

/**
 * Renders a cell to the DOM (no individual event listeners - handled at grid level)
 */
export const renderCell = (cell, parent) => {
    if (!cell.node) {
        cell.node = document.createElement('div');
        cell.node.className = 'cell';
        parent.appendChild(cell.node);
    }
    cell.node.className = cell.alive ? 'cell alive' : 'cell dead';
};

/**
 * Removes cell from DOM
 */
export const unrenderCell = (cell) => {
    if (cell.node && cell.node.parentNode) {
        cell.node.parentNode.removeChild(cell.node);
    }
};
