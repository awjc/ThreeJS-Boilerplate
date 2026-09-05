/**
 * Entry point for the application.
 * Initializes the 3D scene within the specified HTML container.
 */

import { initScene } from "@/scene/main.scene";

const container = document.getElementById('app');

if (container) {
  initScene(container);
} else {
  console.error('Failed to find #app container in index.html');
}
