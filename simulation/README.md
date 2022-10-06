# Many Rivers Simulation

See notes [here](https://docs.google.com/document/d/12PQ0wF_xWlWM-RUFgz8H5vhUfOcaQMElsj9E-nqdxzM/edit).

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