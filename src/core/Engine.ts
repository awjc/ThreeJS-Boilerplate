/**
 * Configuration for the Engine instance.
 */
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { BaseObject } from '@/components/BaseObject';
import { SelectionManager } from '@/selection/SelectionManager';

export interface EngineConfig {
  /** The HTML element that will host the canvas. */
  container: HTMLElement;
  /** Whether to use antialiasing. Defaults to true. */
  antialias?: boolean;
  /** The background color of the renderer. */
  clearColor?: THREE.ColorRepresentation;
}

/**
 * The core Engine class responsible for managing the Three.js renderer,
 * scene, camera, and the animation loop.
 */
export class Engine {
  /** The canvas where we draw everything */
  canvas: HTMLCanvasElement;
  /** The WebGL renderer instance. */
  public renderer: THREE.WebGLRenderer;
  /** The Three.js scene. */
  public scene: THREE.Scene;
  /** The perspective camera. */
  public camera: THREE.PerspectiveCamera;
  /** The set of current objects in the scene that we are rendering */
  private readonly objectsInScene: Set<BaseObject> = new Set();
  private timer: THREE.Timer = new THREE.Timer();
  private isRunning: boolean = false;
  /** Stats is a component showing FPS performance, etc */
  private stats: Stats;
  /** OrbitControls natively handles pan/zoom/rotation via mouse + touchscreen */
  private controls!: OrbitControls;
  /** Manages object hover / selection via mouse */
  private selectionManager: SelectionManager;

  private composer!: EffectComposer;
  private hoverOutlinePass!: OutlinePass;
  private selectionOutlinePass!: OutlinePass;

  /**
   * Creates a new engine instance.
   * @param config Configuration object for the engine.
   */
  constructor(config: EngineConfig) {
    console.log('Initializing Three.JS...')

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      config.container.clientWidth / config.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    // Ensure a canvas exists in the container or create one
    let canvas = config.container.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      config.container.appendChild(canvas);
    }
    this.canvas = canvas;

    // Orbit controls
    this.setupOrbitControls(canvas, config);

    // Set up the stats display and add it to the container
    this.stats = new Stats();
    config.container.appendChild(this.stats.dom);

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas as HTMLCanvasElement,
      antialias: config.antialias ?? true,
      alpha: true
    });
    this.renderer.setSize(config.container.clientWidth, config.container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    if (config.clearColor !== undefined) {
      this.renderer.setClearColor(config.clearColor);
    }

    window.addEventListener('resize', () => this.onResize());

    // Initialize Post-processing
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Setup Hover Outline Pass (gray)
    this.hoverOutlinePass = new OutlinePass(
      new THREE.Vector2(config.container.clientWidth, config.container.clientHeight),
      this.scene,
      this.camera
    );
    this.hoverOutlinePass.edgeStrength = 2.0;
    this.hoverOutlinePass.edgeThickness = 1.0;
    this.hoverOutlinePass.edgeGlow = 0.5;
    this.hoverOutlinePass.visibleEdgeColor.set('#999999');
    this.hoverOutlinePass.hiddenEdgeColor.set('#000000');
    this.composer.addPass(this.hoverOutlinePass);

    // Setup Selection Outline Pass (white)
    this.selectionOutlinePass = new OutlinePass(
      new THREE.Vector2(config.container.clientWidth, config.container.clientHeight),
      this.scene,
      this.camera
    );
    this.selectionOutlinePass.edgeStrength = 4.0;
    this.selectionOutlinePass.edgeThickness = 1.0;
    this.selectionOutlinePass.edgeGlow = 1.0;
    this.selectionOutlinePass.visibleEdgeColor.set('#ffffff');
    this.selectionOutlinePass.hiddenEdgeColor.set('#000000');
    this.composer.addPass(this.selectionOutlinePass);

    // Selection manager does mouse raycasting to find which object is clicked
    this.selectionManager = new SelectionManager(
      this.canvas,
      this.camera,
      this.objectsInScene,
      this.setHoveredObject,
      this.setSelectedObject
    )
    this.selectionManager.init();
  }

  public setHoveredObject = (hoveredObject: BaseObject | undefined) => {
    // Clear any existing state
    this.objectsInScene.forEach(obj => obj.setHovered(false));
    hoveredObject?.setHovered(true);
    this.updateOutline();
  }

  public setSelectedObject = (selectedObject: BaseObject | undefined) => {
    // Clear any existing state
    this.objectsInScene.forEach(obj => obj.setSelected(false));
    selectedObject?.setSelected(true);
    this.updateOutline();
  }

  private updateOutline() {
    const hovered: THREE.Object3D[] = [];
    const selected: THREE.Object3D[] = [];

    this.objectsInScene.forEach(obj => {
      if (obj.isHovered) hovered.push(obj.mesh);
      if (obj.isSelected) selected.push(obj.mesh);
    });

    this.hoverOutlinePass.selectedObjects = hovered;
    this.selectionOutlinePass.selectedObjects = selected;
  }

  /**
   * Initialize the camera controls for the mouse / trackpad
   * - Select object: Left click
   * - Rotate: Right click drag
   * - Pan: Middle click drag / shift + left click drag (trackpad)
   */
  private setupOrbitControls(canvas: HTMLCanvasElement, config: EngineConfig) {
    this.controls = new OrbitControls(this.camera, canvas);

    this.controls.mouseButtons = {
      LEFT: null as unknown as THREE.MOUSE, // normal left click = selection
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.ROTATE,
    };

    // OrbitControls has built-in support for:
    // LEFT + Shift/Ctrl/Meta => PAN.
    //
    // We temporarily expose LEFT as ROTATE when Shift is held,
    // because OrbitControls interprets ROTATE + Shift as PAN.
    canvas.addEventListener(
      'pointerdown',
      (e) => {
        if (e.button === 0 && e.shiftKey) {
          this.controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
        }
      },
      { capture: true }
    );
    const restoreLeftButton = () => {
      this.controls.mouseButtons.LEFT =
        null as unknown as THREE.MOUSE;
    };
    canvas.addEventListener('pointerup', restoreLeftButton, {
      capture: true,
    });
    canvas.addEventListener('pointercancel', restoreLeftButton, {
      capture: true,
    });

    // Prevent browser middle-mouse auto-scroll
    config.container.addEventListener('mousedown', (e) => {
      if (e.button === 1) {
        e.preventDefault();
      }
    });
  }

  /**
   * Adds an object to the engine's update loop.
   */
  public addObject(obj: BaseObject) {
    this.objectsInScene.add(obj);
    this.selectionManager.updateObjectsInScene(this.objectsInScene);
  }

  /**
   * Removes an object from the engine's update loop.
   */
  public removeObject(obj: BaseObject) {
    obj.removeFrom(this.scene);
    this.objectsInScene.delete(obj);
    this.selectionManager.updateObjectsInScene(this.objectsInScene);
  }

  /**
   * Handles window resize events to update camera aspect and renderer size.
   */
  private onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.composer.setSize(width, height);
    this.hoverOutlinePass.setSize(width, height);
    this.selectionOutlinePass.setSize(width, height);
  }

  /**
   * Starts the animation loop.
   */
  public start() {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    this.animate();

    // Start with nothing selected
    this.setHoveredObject(undefined);
    this.setSelectedObject(undefined);
  }

  /**
   * The internal animation loop.
   */
  private animate() {
    if (!this.isRunning) {
      return;
    }
    requestAnimationFrame(() => this.animate());
    this.timer.update();

    const delta = this.timer.getDelta();
    for (const obj of this.objectsInScene) {
      obj.update(delta);
    }

    this.composer.render();

    this.controls.update();
    this.stats.update();
  }
}
