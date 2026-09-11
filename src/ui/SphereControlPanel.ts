import { Sphere } from '@/components/Sphere';
import { BaseControlPanel } from '@/ui/BaseControlPanel';
import { GUI } from 'lil-gui';


/**
 * A control panel for manipulating the properties of Sphere objects.
 * Uses lil-gui to provide a user interface.
 */
export class SphereControlPanel extends BaseControlPanel {
  /**
   * Creates a new control panel instance.
   */
  constructor(gui: GUI, private spheres: Sphere[]) {
    super(gui);
  }

  /**
   * Initializes the GUI with controls for the objects' settings.
   */
  public initialize() {
    this.topLevelFolder = this.gui.addFolder('Sphere Data');
    this.topLevelFolder.close();

    this.spheres.forEach((sphere, idx) => {
      this.initializeSphereSettings(sphere, `Sphere ${idx + 1}`);
    });
  }

  /**
   * Adds a new settings panel to control the given sphere (with the given name)
   */
  public initializeSphereSettings(sphere: Sphere, name: string) {
    const sphereSettings = sphere.getSettings();

    const folder = this.topLevelFolder.addFolder(name);

    folder.add(sphereSettings, 'radius', 0.1, 5).name('Size').onChange((val: number) => {
      sphere.setAppearanceVals({ radius: val })
    });

    folder.addColor(sphereSettings, 'color').name('Color').onChange((val: number) => {
      sphere.setAppearanceVals({ color: val });
    });

    folder.add(sphereSettings, 'metalness', 0, 1).name('Metal').onChange((val: number) => {
      sphere.setAppearanceVals({ metalness: val });
    });

    folder.add(sphereSettings, 'roughness', 0, 1).name('Rough').onChange((val: number) => {
      sphere.setAppearanceVals({ roughness: val });
    });


    folder.add(sphereSettings.position, 'x', -4, 4).name('Pos X').onChange(() => { sphere.syncPosition(); });
    folder.add(sphereSettings.position, 'y', -4, 4).name('Pos Y').onChange(() => { sphere.syncPosition(); });
    folder.add(sphereSettings.position, 'z', -4, 4).name('Pos Z').onChange(() => { sphere.syncPosition(); });

    folder.add(sphereSettings.rotationSpeed, 'x', 0, 5).name('Rot X');
    folder.add(sphereSettings.rotationSpeed, 'y', 0, 5).name('Rot Y');
    folder.add(sphereSettings.rotationSpeed, 'z', 0, 5).name('Rot Z');

    folder.add(sphereSettings, 'flatShading').name('Flat Shading').onChange((val: boolean) => {
      sphere.setAppearanceVals({ flatShading: val });
    });

    // Start with the folder collapsed to avoid clutter
    folder.close()

    // Keep track of it in the main map
    this.objFolders.set(sphere, folder);
  }

  /**
   * Destroys the GUI instance.
   */
  public destroy() {
    this.gui.destroy();
  }
}
