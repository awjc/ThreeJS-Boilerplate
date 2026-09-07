import { Cube } from '@/components/Cube';
import { Controller, GUI } from 'lil-gui';


type Actions = {
  spawnNewCube: () => void;
  deleteLastCube: (idx: number) => void;
  deleteAllCubes: () => void;
}

/**
 * A control panel for manipulating the properties of Cube objects.
 * Uses lil-gui to provide a user interface.
 */
export class CubeControlPanel {
  /** The main top-level gui */
  private gui: GUI;
  /** A mapping of each cube object to its own folder */
  private folders: Map<Cube, GUI>;

  private deleteActionControllers: Set<Controller>;

  /**
   * Creates a new control panel instance.
   * @param cube The Cube object to control.
   */
  constructor(private cubes: Cube[]) {
    this.gui = new GUI();
    this.folders = new Map();
    this.deleteActionControllers = new Set();
  }

  /**
   * Initializes the GUI with controls for the cube's settings.
   */
  public initialize(actions: Actions) {
    this.gui.add(actions, 'spawnNewCube').name('Spawn New Cube');
    this.deleteActionControllers.add(
      this.gui.add(actions, 'deleteLastCube').name('Delete Last Cube'));
    this.deleteActionControllers.add(
      this.gui.add(actions, 'deleteAllCubes').name('Delete All Cubes'));

    this.cubes.forEach((cube, idx) => {
      this.initializeCubeSettings(cube, `Cube ${idx + 1} Settings`);
    });
  }

  /**
   * Adds a new settings panel to control the given cube (with the given name)
   */
  public initializeCubeSettings(cube: Cube, cubeName: string) {
    const cubeSettings = cube.getSettings();

    const folder = this.gui.addFolder(cubeName);

    folder.add(cubeSettings, 'size', 0.1, 5).name('Size').onChange((val: number) => {
      cube.setAppearanceVals({ size: val })
    });

    folder.addColor(cubeSettings, 'color').name('Color').onChange((val: number) => {
      cube.setAppearanceVals({ color: val });
    });

    folder.add(cubeSettings, 'metalness', 0, 1).name('Metalness').onChange((val: number) => {
      cube.setAppearanceVals({ metalness: val });
    });

    folder.add(cubeSettings, 'roughness', 0, 1).name('Roughness').onChange((val: number) => {
      cube.setAppearanceVals({ roughness: val });
    });


    folder.add(cubeSettings.position, 'x', -4, 4).name('Position X').onChange(() => { cube.syncPosition(); });
    folder.add(cubeSettings.position, 'y', -4, 4).name('Position Y').onChange(() => { cube.syncPosition(); });
    folder.add(cubeSettings.position, 'z', -4, 4).name('Position Z').onChange(() => { cube.syncPosition(); });

    folder.add(cubeSettings.rotationSpeed, 'x', 0, 5).name('Rotation X');
    folder.add(cubeSettings.rotationSpeed, 'y', 0, 5).name('Rotation Y');
    folder.add(cubeSettings.rotationSpeed, 'z', 0, 5).name('Rotation Z');

    // Start with the folder collapsed to avoid clutter
    folder.close()

    // Keep track of it in the main map
    this.folders.set(cube, folder);

    // Re-enable the delete controls if they were disabled previously
    this.deleteActionControllers.forEach(controller => controller.enable())
  }

  /**
   * Removes the settings folder corresponding to the given cube
   */
  public removeCubeSettings(cube: Cube) {
    const folder = this.folders.get(cube);
    if (folder) {
      folder.destroy();
      this.folders.delete(cube);
    }

    if (this.folders.size == 0) {
      this.deleteActionControllers.forEach(controller => controller.disable())
    }
  }

  /**
   * Destroys the GUI instance.
   */
  public destroy() {
    this.gui.destroy();
  }
}
