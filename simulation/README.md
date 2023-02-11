# Many Rivers Simulation

See notes [here](https://docs.google.com/document/d/12PQ0wF_xWlWM-RUFgz8H5vhUfOcaQMElsj9E-nqdxzM/edit).
See parameters and data overview [here](https://docs.google.com/document/d/1iB5RIkZLDeMv-5rSvzoV2wJ_OsHZMr0B6UDHJGvZYRQ/edit#).

## Installation

To get this up and running, first clone the repository into your local computer. Go to the project directory in your terminal, and do:

```sh
npm install
```

This will install all of the dependencies you need for this project. Once, this is done, do:

```sh
npm run serve
```

This will to start a development server, and then visit `localhost:8080` in a browser.

There're two other scripts as well:

```sh
npm run build
```

This will compile the assets without a starting a development server. There's also:

```sh
npm run deploy-gh-pages
```

This will compile and push the public folder to a gh-pages branch, in case you quickly want to get a test-site up and running. I'd typically add an additional deploy script for a custom environment later.

## References / Parking Lot

- "Modeling meander morphodynamics over self-formed heterogeneous floodplains." [Here](https://agupubs.onlinelibrary.wiley.com/doi/full/10.1002/2017WR020726) *A non-cellular model of the dynamics we're looking for.*

- "Monte Carlo Geometry Processing". [Here](https://www.cs.cmu.edu/~kmcrane/Projects/MonteCarloGeometryProcessing/paper.pdf) *An non-grid-based approach to interpolating curvature boundary conditions over the river domain by solving a Laplace equation.*

### Lattice Boltzmann Methods in D2Q9 Lattices

- [Application of LBM for Generation of Flow Velocity Field Over Bed Forms](https://www.researchgate.net/publication/258843003_Application_of_Lattice_Boltzmann_Method_for_Generation_of_Flow_Velocity_Field_Over_River_Bed-Forms). This considers a one-way coupling between static bed-forms and the hydrodynamics in a cross-section.

- [A lattice Boltzmann model for the open channel flows described by the Saint-Venant equations](https://royalsocietypublishing.org/doi/10.1098/rsos.190439). Describes flow in plan.

- [Create your Own Lattice Boltzmann Simulation (with Python)](https://medium.com/swlh/create-your-own-lattice-boltzmann-simulation-with-python-8759e8b53b1c). Super good intro to how the LBM equation is discretized for free flow / flat bed situations. Has a python implementation.

- [A 1D–2D Coupled Lattice Boltzmann Modelfor Shallow Water Flows in Large ScaleRiver-Lake Systems](https://www.researchgate.net/publication/338120174_A_1D-2D_Coupled_Lattice_Boltzmann_Model_for_Shallow_Water_Flows_in_Large_Scale_River-Lake_Systems)