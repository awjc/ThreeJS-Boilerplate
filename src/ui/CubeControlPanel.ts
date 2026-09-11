import { Cube } from '@/components/Cube';
import { BaseControlPanel } from '@/ui/BaseControlPanel';
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
export class CubeControlPanel extends BaseControlPanel {
  /** The controllers for delete actions which get enabled/disabled depending on number of cubes */
  private deleteActionControllers: Set<Controller>;

  constructor(gui: GUI, private cubes: Cube[]) {
    super(gui);
    this.deleteActionControllers = new Set();
  }

  /**
   * Initializes the GUI with controls for the objects' settings.
   */
  public initialize(actions: Actions) {
    this.gui.add(actions, 'spawnNewCube').name('Spawn New Cube');
    this.deleteActionControllers.add(
      this.gui.add(actions, 'deleteLastCube').name('Delete Last Cube'));
    this.deleteActionControllers.add(
      this.gui.add(actions, 'deleteAllCubes').name('Delete All Cubes'));

    this.topLevelFolder = this.gui.addFolder('Cube Data');
    this.topLevelFolder.close();

    this.cubes.forEach((cube, idx) => {
      this.initializeCubeSettings(cube, `Cube ${idx + 1}`);
    });
  }

  /**
   * Adds a new settings panel to control the given cube (with the given name)
   */
  public initializeCubeSettings(cube: Cube, name: string) {
    const cubeSettings = cube.getSettings();

    const folder = this.topLevelFolder.addFolder(name);

    folder.add(cubeSettings, 'size', 0.1, 5).name('Size').onChange((val: number) => {
      cube.setAppearanceVals({ size: val })
    });

    folder.addColor(cubeSettings, 'color').name('Color').onChange((val: number) => {
      cube.setAppearanceVals({ color: val });
    });

    folder.add(cubeSettings, 'metalness', 0, 1).name('Metal').onChange((val: number) => {
      cube.setAppearanceVals({ metalness: val });
    });

    folder.add(cubeSettings, 'roughness', 0, 1).name('Rough').onChange((val: number) => {
      cube.setAppearanceVals({ roughness: val });
    });


    folder.add(cubeSettings.position, 'x', -4, 4).name('Pos X').onChange(() => { cube.syncPosition(); });
    folder.add(cubeSettings.position, 'y', -4, 4).name('Pos Y').onChange(() => { cube.syncPosition(); });
    folder.add(cubeSettings.position, 'z', -4, 4).name('Pos Z').onChange(() => { cube.syncPosition(); });

    folder.add(cubeSettings.rotationSpeed, 'x', 0, 5).name('Rot X');
    folder.add(cubeSettings.rotationSpeed, 'y', 0, 5).name('Rot Y');
    folder.add(cubeSettings.rotationSpeed, 'z', 0, 5).name('Rot Z');

    folder.add(cubeSettings, 'flatShading').name('Flat Shading').onChange((val: boolean) => {
      cube.setAppearanceVals({ flatShading: val });
    });

    // Start with the folder collapsed to avoid clutter
    folder.close()

    // Keep track of it in the main map
    this.objFolders.set(cube, folder);

    // Re-enable the delete controls if they were disabled previously
    this.deleteActionControllers.forEach(controller => controller.enable())
  }

  /**
   * Removes the settings folder corresponding to the given cube
   */
  public removeCubeSettings(cube: Cube) {
    const folder = this.objFolders.get(cube);
    if (folder) {
      folder.destroy();
      this.objFolders.delete(cube);
    }

    if (this.objFolders.size == 0) {
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
