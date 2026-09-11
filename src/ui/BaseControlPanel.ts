import { BaseObject } from "@/components/BaseObject";
import GUI from "lil-gui";

export abstract class BaseControlPanel {
  /** Top level subfolder for all folders of a type, e.g. Cube Data */
  protected topLevelFolder!: GUI;
  /** A mapping of each object to its own folder */
  protected objFolders!: Map<BaseObject, GUI>;
  /** The currently selected object, if any */
  protected selectedObj: BaseObject | undefined;

  /**
   * Creates a new control panel instance in the given top-level GUI
   */
  constructor(protected gui: GUI) {
    this.objFolders = new Map();
  }


  /** When the given object has been selected, opens its corresponding controls. If undefined is passed, closes the controls */
  public setSelectedObj(obj: BaseObject | undefined) {
    // Close previous one if it was opened
    if (this.selectedObj) {
      this.objFolders.get(this.selectedObj)?.close();
    }

    if (obj) {
      this.gui.open();
      this.topLevelFolder.open();
      this.objFolders.get(obj)?.open();
    } else {
      this.topLevelFolder.close();
    }

    this.selectedObj = obj;
  }
}
