# ThreeJS-Boilerplate
Boilerplate ThreeJS config with npm, vite, typescript and some basic common configs

## Architecture

This project follows a modular component-based architecture:

- **Core (`/core`)**: Contains the `Engine` class, which manages the Three.js lifecycle (renderer, scene, camera, resize, and animation loop).
- **Components (`/components`)**: Defines interactive 3D objects. All objects extend `BaseObject` to provide a consistent `update` interface for the animation loop.
- **Scene (`/scene`)**: Orchestrates the high-level setup, initializing the engine, lights, and scene objects.
- **UI (`/ui`)**: Manages user interface elements (e.g., via `lil-gui`) to interact with scene objects.
