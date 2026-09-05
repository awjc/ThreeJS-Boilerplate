# ThreeJS-Boilerplate
Boilerplate ThreeJS config with npm, vite, typescript and some basic common configs

## Architecture

This project follows a modular component-based architecture:

- **Core (`/core`)**: Contains the `Engine` class, which manages the Three.js lifecycle (renderer, scene, camera, resize, and animation loop).
- **Components (`/components`)**: Defines interactive 3D objects. All objects extend `BaseObject` to provide a consistent `update` interface for the animation loop.
- **Scene (`/scene`)**: Orchestrates the high-level setup, initializing the engine, lights, and scene objects.
- **UI (`/ui`)**: Manages user interface elements (e.g., via `lil-gui`) to interact with scene objects.


## Setup
Run
```bash
$ npm install
$ npm run dev
```
to run the dev server via Vite.

## Deployment via Github Pages

To deploy to Github Pages (after forking this repo), go to the repo settings on Github, go to Pages, under Build & Deployment, and set `source` to `Github Actions`.
Then, push to the `main` branch and the `.github/workflows/deploy.yml` job should run and deploy so the site will be live on `https://<username>.github.io/<repo-name>`
