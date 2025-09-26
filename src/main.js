// UnoCSS virtual import - generates utility classes on-demand
import 'virtual:uno.css';

// Main styles
import './styles/main.scss';

// Game modules
import { createGrid, initGrid } from './game/grid.js';
import { initControls } from './ui/controls.js';

// Initialize the game
const grid = createGrid();
initControls(grid);
initGrid(grid);
