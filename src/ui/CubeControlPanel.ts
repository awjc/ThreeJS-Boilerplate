import { Cube } from '@/components/Cube';
import { GUI } from 'lil-gui';

/**
 * A control panel for manipulating the properties of a Cube object.
 * Uses lil-gui to provide a user interface.
 */
export class CubeControlPanel {
  private gui: GUI;

  /**
   * Creates a new control panel instance.
   * @param cube The Cube object to control.
   */
  constructor(private cube: Cube) {
    this.gui = new GUI();
  }

  /**
   * Initializes the GUI with controls for the cube's settings.
   */
  public initialize() {
    const settings = this.cube.getSettings();

    const folder = this.gui.addFolder('Cube Settings');

    folder.add(settings, 'size', 0.1, 5).name('Size').onChange((val: number) => {
      this.cube.updateAppearance({ size: val })
    });

    folder.addColor(settings, 'color').name('Color').onChange((val: number) => {
      this.cube.updateAppearance({ color: val });
    });

    folder.add(settings, 'rotationSpeed', 0, 10).name('Rotation').onChange(() => { });

    // Note: The way update was implemented in Cube uses settings directly from the object for rotation
    // but for material properties we need to manually trigger updateAppearance.

    folder.add(settings, 'metalness', 0, 1).name('Metalness').onChange((val: number) => {
      this.cube.updateAppearance({ metalness: val });
    });

    folder.add(settings, 'roughness', 0, 1).name('Roughness').onChange((val: number) => {
      this.cube.updateAppearance({ roughness: val });
    });

    folder.open();
  }

  /**
   * Destroys the GUI instance.
   */
  public destroy() {
    this.gui.destroy();
  }
}
