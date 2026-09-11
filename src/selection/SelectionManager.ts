import { BaseObject } from '@/components/BaseObject';
import * as THREE from 'three';

/** Mouse movement below this many pixels is treated as a click, not a drag. */
const DRAG_THRESHOLD = 10;

/**
 * SelectionManager — listens for left-click on the canvas and raycasts
 * against the objects to determine which one was clicked.
 */
export class SelectionManager {
    private readonly raycaster = new THREE.Raycaster();
    // Mouse location in normalized device coords
    private readonly ndcMouse = new THREE.Vector2();
    private mouseDownX = 0;
    private mouseDownY = 0;
    private meshesInScene!: THREE.Mesh[];

    constructor(
        private canvas: HTMLCanvasElement, private camera: THREE.Camera, objectsInScene: Set<BaseObject>,
        private setHoveredObject: (_: BaseObject | undefined) => void,
        private setSelectedObject: (_: BaseObject | undefined) => void) {
        this.updateObjectsInScene(objectsInScene);
    }

    /** Update the set of objects in the scene when they are added / deleted */
    public updateObjectsInScene(objectsInScene: Set<BaseObject>) {
        // The raycasting takes place on the meshes
        this.meshesInScene = [...objectsInScene].map(c => c.mesh);
    }

    public init() {
        this.canvas.addEventListener('mousedown', this.onMouseDown);
        this.canvas.addEventListener('mouseup', this.onMouseUp);
        this.canvas.addEventListener('mousemove', this.onMouseMove);
    }

    private toNDC(clientX: number, clientY: number): void {
        const rect = this.canvas.getBoundingClientRect();
        this.ndcMouse.set(
            ((clientX - rect.left) / rect.width) * 2 - 1,
            -((clientY - rect.top) / rect.height) * 2 + 1,
        );
    }

    private onMouseDown = (e: MouseEvent): void => {
        this.mouseDownX = e.clientX;
        this.mouseDownY = e.clientY;
    };

    private onMouseUp = (e: MouseEvent): void => {
        // Ignore if the mouse moved enough to be a drag
        const dx = e.clientX - this.mouseDownX;
        const dy = e.clientY - this.mouseDownY;
        if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) return;

        this.toNDC(e.clientX, e.clientY);
        this.raycaster.setFromCamera(this.ndcMouse, this.camera);
        const hits = this.raycaster.intersectObjects(this.meshesInScene);

        if (hits.length > 0) {
            const clickedMesh = hits[0].object;
            const selectedObject = clickedMesh.userData.baseObject as BaseObject;
            this.setSelectedObject(selectedObject);
        } else {
            this.setSelectedObject(undefined);
        }
    };

    private onMouseMove = (e: MouseEvent): void => {
        this.toNDC(e.clientX, e.clientY);
        this.raycaster.setFromCamera(this.ndcMouse, this.camera);
        const hits = this.raycaster.intersectObjects(this.meshesInScene);

        if (hits.length > 0) {
            const hoveredMesh = hits[0].object;
            const hoveredObject = hoveredMesh.userData.baseObject as BaseObject;
            this.setHoveredObject(hoveredObject);
            this.canvas.style.cursor = 'pointer';
        } else {
            this.setHoveredObject(undefined);
            this.canvas.style.cursor = 'default';
        }
    };

    dispose(): void {
        this.canvas.removeEventListener('mousedown', this.onMouseDown);
        this.canvas.removeEventListener('mouseup', this.onMouseUp);
        this.canvas.removeEventListener('mousemove', this.onMouseMove);
    }
}
