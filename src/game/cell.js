/**
 * Cell - functional approach for Game of Life cells
 */

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
 * Determines if a cell should die based on Game of Life rules
 */
export const shouldDie = (cell) => {
    const aliveNeighbors = countAliveNeighbors(cell);

    // Alive cell survives with 2 or 3 neighbors
    if (cell.alive && (aliveNeighbors === 2 || aliveNeighbors === 3)) {
        return false;
    }

    // Dead cell becomes alive with exactly 3 neighbors
    if (!cell.alive && aliveNeighbors === 3) {
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
 * Renders a cell to the DOM
 */
export const renderCell = (cell, parent) => {
    if (!cell.node) {
        cell.node = document.createElement('div');
        cell.node.className = 'cell';
        cell.node.addEventListener('click', () => {
            toggleCell(cell);
            renderCell(cell, parent);
        });
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
