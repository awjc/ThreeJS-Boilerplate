import * as THREE from 'three';

/**
 * An abstract base class for all interactive objects in the scene.
 * Provides common functionality for adding/removing meshes from a scene and an update interface.
 */
export abstract class BaseObject {
  protected isHovered: boolean = false;
  protected isSelected: boolean = false;

  protected HOVERED_COLOR: THREE.ColorRepresentation = '#770077';
  protected SELECTED_COLOR: THREE.ColorRepresentation = '#ff00ff';


  /**
   * Creates an instance of BaseObject.
   * @param mesh The Three.js mesh associated with this object.
   */
  constructor(public mesh: THREE.Mesh) {
    // Store the application object on the Three.js object itself, to retrieve when needed (e.g. during raycasting)
    mesh.userData.baseObject = this;
  }

  /**
   * Updates the object's state.
   * @param deltaSecs The time elapsed since the last update in seconds.
   */
  abstract update(deltaSecs: number): void;

  /**
   * Adds the object's mesh to the provided scene.
   * @param scene The Three.js scene to add the mesh to.
   */
  public addTo(scene: THREE.Scene) {
    scene.add(this.mesh);
  }

  /**
   * Removes the object's mesh from the provided scene.
   * @param scene The Three.js scene to remove the mesh from.
   */
  public removeFrom(scene: THREE.Scene) {
    scene.remove(this.mesh);
  }

  public setHovered(isHovered: boolean) {
    this.isHovered = isHovered;
  }

  public setSelected(isSelected: boolean) {
    this.isSelected = isSelected;
  }
}
