import * as THREE from 'three';
import { BaseObject } from '@/components/BaseObject';

/**
 * Configuration settings for a Cube object.
 */
export interface CubeSettings {
  /** The length of one of the sides of the cube */
  size: number,
  /** The color of the cube. */
  color: number;
  /** The speed at which the cube rotates. */
  rotationSpeed: number;
  /** The metalness of the cube's material. */
  metalness: number;
  /** The roughness of the cube's material. */
  roughness: number;
}

/**
 * A Cube component that extends BaseObject, representing a 3D cube in the scene.
 * Handles its own rotation and appearance updates.
 */
export class Cube extends BaseObject {
  private settings: CubeSettings;

  /**
   * Creates a new Cube instance and adds it to the scene.
   * @param scene The Three.js scene.
   * @param initialSettings The initial settings for the cube.
   */
  constructor(scene: THREE.Scene, initialSettings: CubeSettings) {
    const geometry = new THREE.BoxGeometry(initialSettings.size, initialSettings.size, initialSettings.size);
    const material = new THREE.MeshStandardMaterial({
      color: initialSettings.color,
      metalness: initialSettings.metalness,
      roughness: initialSettings.roughness
    });

    const mesh = new THREE.Mesh(geometry, material);

    super(mesh);
    this.settings = initialSettings;
    this.addTo(scene);
  }

  /**
   * Updates the cube's rotation based on delta time.
   * @param deltaSecs The time elapsed since the last update in seconds.
   */
  public update(deltaSecs: number): void {
    this.mesh.rotation.x += deltaSecs * this.settings.rotationSpeed;
    this.mesh.rotation.y += deltaSecs * this.settings.rotationSpeed;
  }

  /**
   * Updates the visual appearance of the cube's material.
   * @param updates An object containing the partial updates for the settings.
   */
  public updateAppearance(updates: Partial<CubeSettings>) {
    const mat = this.mesh.material as THREE.MeshStandardMaterial;

    if (updates.size !== undefined) {
      this.mesh.geometry.dispose();
      this.mesh.geometry = new THREE.BoxGeometry(updates.size, updates.size, updates.size);
    }

    if (updates.color !== undefined) mat.color.set(updates.color);
    if (updates.metalness !== undefined) mat.metalness = updates.metalness;
    if (updates.roughness !== undefined) mat.roughness = updates.roughness;
  }

  /**
   * Gets the current settings of the cube.
   * @returns The CubeSettings object.
   */
  public getSettings() {
    return this.settings;
  }
}
