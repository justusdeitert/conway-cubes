/**
 * Three.js Renderer for Game of Life
 * Uses InstancedMesh for high-performance rendering
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Constants
const CELL_SIZE = 1;
const CELL_GAP = 0.15;
const CELL_HEIGHT_ALIVE = 0.25;
const CELL_HEIGHT_DEAD = 0.1;
const CELL_FLOAT_OFFSET = 0.35; // How high alive cells float above the grid

// Colors
const ACCENT_COLOR = new THREE.Color(0x10b981);
const ACCENT_BRIGHT = new THREE.Color(0x10b981);
const DEAD_COLOR = new THREE.Color(0x4a4a4f);
const BACKGROUND_COLOR = new THREE.Color(0x0a0a0b);

// Renderer state
let renderer, scene, camera, controls;
let instancedMesh;
let gridSize = 0;
let animationId = null;
let isAutoRotating = true;

// Temp objects for matrix calculations (reused to avoid GC)
const tempMatrix = new THREE.Matrix4();
const tempPosition = new THREE.Vector3();
const tempQuaternion = new THREE.Quaternion();
const tempScale = new THREE.Vector3();
const tempColor = new THREE.Color();

// Target states for smooth animation
let targetHeights = [];
let currentHeights = [];
let targetColors = [];
let targetFloats = [];
let currentFloats = [];

/**
 * Initialize the Three.js scene
 */
export const initRenderer = (container) => {
    // Scene
    scene = new THREE.Scene();
    scene.background = BACKGROUND_COLOR;

    // Camera
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    camera.position.set(0, 25, 25);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Orbit Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.minDistance = 10;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI / 2.2;

    // Lighting
    setupLighting();

    // Handle resize
    window.addEventListener('resize', onWindowResize);

    // Start render loop
    animate();

    return { renderer, scene, camera, controls };
};

/**
 * Setup scene lighting
 */
const setupLighting = () => {
    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    // Main directional light with shadows
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 100;
    mainLight.shadow.camera.left = -30;
    mainLight.shadow.camera.right = 30;
    mainLight.shadow.camera.top = 30;
    mainLight.shadow.camera.bottom = -30;
    scene.add(mainLight);

    // Accent colored point light for glow effect
    const accentLight = new THREE.PointLight(ACCENT_COLOR, 2, 60);
    accentLight.position.set(0, 10, 0);
    scene.add(accentLight);

    // Secondary fill light
    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.6);
    fillLight.position.set(-10, 10, -10);
    scene.add(fillLight);
};

/**
 * Create the instanced mesh for the grid
 */
export const createGridMesh = (size) => {
    // Remove existing mesh
    if (instancedMesh) {
        scene.remove(instancedMesh);
        instancedMesh.geometry.dispose();
        instancedMesh.material.dispose();
    }

    gridSize = size;
    const totalCells = size * size;

    // Initialize height and float arrays
    targetHeights = new Array(totalCells).fill(CELL_HEIGHT_DEAD);
    currentHeights = new Array(totalCells).fill(CELL_HEIGHT_DEAD);
    targetColors = new Array(totalCells).fill(false);
    targetFloats = new Array(totalCells).fill(0);
    currentFloats = new Array(totalCells).fill(0);

    // Geometry - rounded box effect using beveled edges
    const geometry = new THREE.BoxGeometry(
        CELL_SIZE - CELL_GAP,
        1, // Height will be scaled per instance
        CELL_SIZE - CELL_GAP,
        1, 1, 1
    );

    // Material with emissive for glow effect
    const material = new THREE.MeshStandardMaterial({
        color: DEAD_COLOR,
        metalness: 0.2,
        roughness: 0.5,
        emissive: new THREE.Color(0x000000),
        emissiveIntensity: 0,
    });

    // Create instanced mesh
    instancedMesh = new THREE.InstancedMesh(geometry, material, totalCells);
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;

    // Position all instances
    const offset = (size * CELL_SIZE) / 2 - CELL_SIZE / 2;

    for (let i = 0; i < totalCells; i++) {
        const x = (i % size) * CELL_SIZE - offset;
        const z = Math.floor(i / size) * CELL_SIZE - offset;

        tempPosition.set(x, CELL_HEIGHT_DEAD / 2, z);
        tempQuaternion.identity();
        tempScale.set(1, CELL_HEIGHT_DEAD, 1);

        tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
        instancedMesh.setMatrixAt(i, tempMatrix);
        instancedMesh.setColorAt(i, DEAD_COLOR);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    instancedMesh.instanceColor.needsUpdate = true;

    scene.add(instancedMesh);
};

/**
 * Update cell states from game logic
 */
export const updateCells = (cells) => {
    if (!instancedMesh) return;

    cells.forEach((cell, index) => {
        targetHeights[index] = cell.alive ? CELL_HEIGHT_ALIVE : CELL_HEIGHT_DEAD;
        targetColors[index] = cell.alive;
        targetFloats[index] = cell.alive ? CELL_FLOAT_OFFSET : 0;
    });
};

/**
 * Smoothly interpolate cell heights and colors
 */
const animateCells = () => {
    if (!instancedMesh) return;

    const offset = (gridSize * CELL_SIZE) / 2 - CELL_SIZE / 2;
    let needsUpdate = false;

    for (let i = 0; i < gridSize * gridSize; i++) {
        const targetHeight = targetHeights[i];
        const currentHeight = currentHeights[i];
        const targetFloat = targetFloats[i];
        const currentFloat = currentFloats[i];

        // Smooth interpolation for height and float
        const newHeight = currentHeight + (targetHeight - currentHeight) * 0.15;
        const newFloat = currentFloat + (targetFloat - currentFloat) * 0.12;

        if (Math.abs(newHeight - currentHeight) > 0.001 || Math.abs(newFloat - currentFloat) > 0.001) {
            currentHeights[i] = newHeight;
            currentFloats[i] = newFloat;
            needsUpdate = true;

            const x = (i % gridSize) * CELL_SIZE - offset;
            const z = Math.floor(i / gridSize) * CELL_SIZE - offset;

            // Position includes float offset - cells float above the grid
            tempPosition.set(x, newHeight / 2 + newFloat, z);
            tempQuaternion.identity();
            tempScale.set(1, newHeight, 1);

            tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
            instancedMesh.setMatrixAt(i, tempMatrix);

            // Color interpolation - use brighter color for alive cells
            const isAlive = targetColors[i];
            const colorLerp = (newHeight - CELL_HEIGHT_DEAD) / (CELL_HEIGHT_ALIVE - CELL_HEIGHT_DEAD);
            tempColor.lerpColors(DEAD_COLOR, isAlive ? ACCENT_BRIGHT : DEAD_COLOR, colorLerp);
            instancedMesh.setColorAt(i, tempColor);
        }
    }

    if (needsUpdate) {
        instancedMesh.instanceMatrix.needsUpdate = true;
        instancedMesh.instanceColor.needsUpdate = true;
    }
};

/**
 * Main animation loop
 */
const animate = () => {
    animationId = requestAnimationFrame(animate);

    // Update controls
    controls.update();

    // Animate cell heights
    animateCells();

    // Render
    renderer.render(scene, camera);
};

/**
 * Handle window resize
 */
const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};

/**
 * Toggle auto-rotation
 */
export const toggleAutoRotate = () => {
    isAutoRotating = !isAutoRotating;
    controls.autoRotate = isAutoRotating;
    return isAutoRotating;
};

/**
 * Disable orbit controls (for drawing)
 */
export const disableControls = () => {
    if (controls) {
        controls.enabled = false;
    }
};

/**
 * Enable orbit controls
 */
export const enableControls = () => {
    if (controls) {
        controls.enabled = true;
    }
};

/**
 * Set auto-rotation speed
 */
export const setAutoRotateSpeed = (speed) => {
    controls.autoRotateSpeed = speed;
};

/**
 * Reset camera to default position
 */
export const resetCamera = () => {
    camera.position.set(0, 25, 25);
    camera.lookAt(0, 0, 0);
    controls.reset();
};

/**
 * Cleanup renderer resources
 */
export const disposeRenderer = () => {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    if (instancedMesh) {
        instancedMesh.geometry.dispose();
        instancedMesh.material.dispose();
        scene.remove(instancedMesh);
    }

    if (renderer) {
        renderer.dispose();
    }

    window.removeEventListener('resize', onWindowResize);
};

/**
 * Get raycaster intersection for cell picking
 */
export const getCellAtPosition = (event, cells) => {
    if (!instancedMesh || !cells.length) return null;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(instancedMesh);

    if (intersects.length > 0) {
        const instanceId = intersects[0].instanceId;
        return cells[instanceId] || null;
    }

    return null;
};
