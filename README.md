# Many Rivers

> The project consists of a computational model that aims to anticipate the future geomorphology of the Rio Grande / Río Bravo and, with it, of the U.S.- Mexico border. Taking into account the physics that participate in the large-scale evolution of the river, the program generates speculative landscapes by simulating complex interactions between water and land in specific places and across geological temporalities.

> A pipeline of several computational steps calculates the capacities of water to erode land and of land to accumulate sediments. As the river&rsquo;s waters push towards the inside of its meanders, the outer bends smooth out, generating an intensifying feedback loop that results in geometric transformations. The shape of the simulated rivers evolve over time using a dense grid of computational cells with locally-defined rules. The volume of water in each cell changes in response to the gradients of land and water surrounding it — carrying materials into or away from it. The flows of these materials affect such gradients where water determines where sediments concentrate while land affects water behaviors.

> Using topographic scans from the US Geological Survey the simulator explores the ever-changing course of the river as a border technology. The border expands and contracts permanently. It is dynamically renegotiated where each act of measurement allows for the recalibration of the authority exercised over it. Given its instability, it would seem as if rivers wouldn&rsquo;t be the best way to demarcate borders. However such movement, paradoxically, generates the conditions that are used to justify the application of force over it — the operational regimes that reinforce the river as an artificial limit.

This is a single repository intended to unify and organize our computational work on the 2023 _All Possible Rivers_ project. Inside you'll find directories for various pillars of the effort: `site`, `tools`, and `simulation`. A goal of this repository is to make data and assets related to this installation as discoverable and reusable as possible. Fingers crossed for future deplyments 🙃.

## Site

The `site` directory contains a next.js app that runs the web-based simulator with a variety of UI overlays. This subdirectory is automatically deployed to `vercel` when `main` receives pushes.

## Tools

The `tools` directory contains manifest files defining the 15 river segments used in this version of the simulator. These segments are processed from large-scale, USGS 1 meter digital elevation models. The python scripts in this directly are used to convert the USGS `.tif` files into encoded `.png` files that our web-based simulator can use. Each `.tif` produces two `.pngs`, and encoded terrain height map, and a boundary map that defines wet locations and boundary conditions.

## Simulation

_Currently Unused._ The `simulation` directory contains code for a WebGL-based simulation playground, which Lukas and Nic used to prototype intial versions of the simulator. Note that the code in this directory is used for prototyping and play, and not for the production version of the simulator, which can be found in `site/simulation`.
