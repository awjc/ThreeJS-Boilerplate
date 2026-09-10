import * as THREE from 'three';
import { Cube, CubeSettings } from '@/components/Cube';
import { CubeControlPanel } from '@/ui/CubeControlPanel';
import { Engine } from '@/core/Engine';
import { Sphere, SphereSettings } from '@/components/Sphere';
import { SphereControlPanel } from '@/ui/SphereControlPanel';
import GUI from 'lil-gui';

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
  const cube1Settings: CubeSettings = {
    size: 2.0,
    color: '#00a2ff',
    position: new THREE.Vector3(-2.0, 0.0, 0.0),
    rotationSpeed: new THREE.Vector3(0.7, 0.9, 0.1),
    metalness: 0.9,
    roughness: 0.6,
    flatShading: false,
  };

  const cube2Settings: CubeSettings = {
    size: 1.0,
    color: '#00ff7b',
    position: new THREE.Vector3(1.0, 1.0, 1.0),
    rotationSpeed: new THREE.Vector3(1.0, 0.5, 0.3),
    metalness: 0.9,
    roughness: 0.6,
    flatShading: true,
  };

  const cubes: Cube[] = [];
  for (const settings of [cube1Settings, cube2Settings]) {
    const cube = new Cube(engine.scene, settings);
    engine.addObject(cube);
    cubes.push(cube);
  }


  // 4. Setup Control Panel with custom action set

  // This will be the top level gui shared by the different panels
  const gui = new GUI({ /* some options can go here */ });

  const cubeControls = new CubeControlPanel(gui, cubes);

  const spawnNewCube = () => {
    const newCubeSettings: CubeSettings = {
      size: THREE.MathUtils.randFloat(0.4, 2),
      color: new THREE.Color().setHSL(
        THREE.MathUtils.randFloat(0, 1),
        THREE.MathUtils.randFloat(0.7, 1),
        THREE.MathUtils.randFloat(0.3, 1)),
      position: new THREE.Vector3(
        THREE.MathUtils.randFloat(-3, 3),
        THREE.MathUtils.randFloat(-3, 3),
        THREE.MathUtils.randFloat(-3, 3)),
      rotationSpeed: new THREE.Vector3(
        THREE.MathUtils.randFloat(0, 2),
        THREE.MathUtils.randFloat(0, 2),
        THREE.MathUtils.randFloat(0, 2)),
      metalness: THREE.MathUtils.randFloat(0.2, 0.9),
      roughness: THREE.MathUtils.randFloat(0.2, 0.9),
      flatShading: THREE.MathUtils.randFloat(0, 1) < 0.5,
    };
    const newCube = new Cube(engine.scene, newCubeSettings);
    engine.addObject(newCube);
    cubes.push(newCube);

    cubeControls.initializeCubeSettings(newCube, `Cube ${cubes.length}`);
  }

  const deleteLastCube = () => {
    const lastCube = cubes.pop()
    if (lastCube) {
      engine.removeObject(lastCube);
      cubeControls.removeCubeSettings(lastCube);
    }
  }

  const deleteAllCubes = () => {
    const confirmed = window.confirm('Delete all cubes?');
    if (!confirmed) return;

    while (cubes.length > 0) {
      deleteLastCube()
    }
  }

  const cubeActions = { spawnNewCube, deleteLastCube, deleteAllCubes }
  cubeControls.initialize(cubeActions);


  const sphereSettings: SphereSettings = {
    radius: 1.5,
    color: '#ff5900',
    position: new THREE.Vector3(1.0, -1.0, -0.8),
    rotationSpeed: new THREE.Vector3(0.2, 0.7, 0.8),
    metalness: 0.9,
    roughness: 0.6,
    flatShading: true,
  };
  const sphere = new Sphere(engine.scene, sphereSettings);
  engine.addObject(sphere);

  const spheres = [sphere];
  const sphereControls = new SphereControlPanel(gui, spheres);
  sphereControls.initialize();


  // 5. Start
  engine.start();
}
