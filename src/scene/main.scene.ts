import * as THREE from 'three';
import { Cube, CubeSettings } from '@/components/Cube';
import { CubeControlPanel } from '@/ui/CubeControlPanel';
import { Engine } from '@/core/Engine';

/**
 * Initializes the main 3D scene, including the engine, lighting, cube, and control panel.
 * @param container The HTML element where the scene will be rendered.
 */
export function initScene(container: HTMLElement) {
  // 1. Initialize Engine
  const engine = new Engine({
    container,
    clearColor: '#1a1a1a'
  });

  // 2. Add Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  engine.scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 50);
  pointLight.position.set(5, 5, 5);
  engine.scene.add(pointLight);

  // 3. Add Components
  const initialCubeSettings: CubeSettings = {
    size: 2.0,
    color: 0x00ff33,
    rotationSpeed: 1.0,
    metalness: 0.9,
    roughness: 0.6
  };

  const cube = new Cube(engine.scene, initialCubeSettings);
  engine.addObject(cube);

  // 4. Setup Control Panel
  const controls = new CubeControlPanel(cube);
  controls.initialize();

  // 5. Start
  engine.start();
}
