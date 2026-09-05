/**
 * Configuration for the Engine instance.
 */
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BaseObject } from '@/components/BaseObject';

export interface EngineConfig {
  /** The HTML element that will host the canvas. */
  container: HTMLElement;
  /** Whether to use antialiasing. Defaults to true. */
  antialias?: boolean;
  /** The background color of the renderer. */
  clearColor?: string | number;
}

/**
 * The core Engine class responsible for managing the Three.js renderer,
 * scene, camera, and the animation loop.
 */
export class Engine {
  /** The WebGL renderer instance. */
  public renderer: THREE.WebGLRenderer;
  /** The Three.js scene. */
  public scene: THREE.Scene;
  /** The perspective camera. */
  public camera: THREE.PerspectiveCamera;
  private objects: Set<BaseObject> = new Set();
  private timer: THREE.Timer = new THREE.Timer();
  private isRunning: boolean = false;
  /** Stats is a component showing FPS performance, etc */
  private stats: Stats;
  /** OrbitControls natively handles pan/zoom/rotation via mouse + touchscreen */
  private controls: OrbitControls;


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

    // Orbit controls — left/middle drag pans, right drag orbits
    this.controls = new OrbitControls(this.camera, canvas);
    // this.controls.enableDamping = true;
    // this.controls.dampingFactor = 0.06;
    this.controls.mouseButtons = {
      LEFT: null as unknown as THREE.MOUSE, // repurposed for object selection
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.ROTATE,
    };
    // Also suppress default mouse events on the canvas
    config.container.addEventListener('mousedown', (e) => {
      e.preventDefault();
    });

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
  }

  /**
   * Adds an object to the engine's update loop.
   */
  public addObject(obj: any) {
    this.objects.add(obj);
  }

  /**
   * Removes an object from the engine's update loop.
   */
  public removeObject(obj: any) {
    this.objects.delete(obj);
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
    for (const obj of this.objects) {
      obj.update(delta);
    }

    this.renderer.render(this.scene, this.camera);

    this.controls.update();
    this.stats.update();
  }
}


