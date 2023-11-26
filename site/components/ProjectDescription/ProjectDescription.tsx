import { TILE_SIZE } from "@/simulation/constants";

export const description =
  "The project consists of a computational model that aims to anticipate the future geomorphology of the Rio Grande / Río Bravo and, with it, of the U.S.- Mexico border. Taking into account the physics that participate in the large-scale evolution of the river, the program generates speculative landscapes by simulating complex interactions between water and land in specific places and across geological temporalities.";

export default function ProjectDescription() {
  const gridSize = `${TILE_SIZE[0]} × ${TILE_SIZE[1]}`;
  const numCells = (TILE_SIZE[0] * TILE_SIZE[1]).toLocaleString("es-MX");

  return (
    <>
      {/* Description */}
      <div className="mt-4 indent-10 uppercase">Project Description</div>
      <div className="mt-4">{description}</div>
      <div className="mt-4">
        A pipeline of several computational steps calculates the capacities of
        water to erode land and of land to accumulate sediments. As the
        river&rsquo;s waters push towards the inside of its meanders, the outer
        bends smooth out, generating an intensifying feedback loop that results
        in geometric transformations. The shape of the simulated rivers evolve
        over time using a dense grid of computational cells with locally-defined
        rules. The volume of water in each cell changes in response to the
        gradients of land and water surrounding it — carrying materials into or
        away from it. The flows of these materials affect such gradients where
        water determines where sediments concentrate while land affects water
        behaviors.
      </div>
      <div className="mt-4">
        Using topographic scans from the US Geological Survey the simulator
        explores the ever-changing course of the river as a border technology.
        The border expands and contracts permanently. It is dynamically
        renegotiated where each act of measurement allows for the recalibration
        of the authority exercised over it. Given its instability, it would seem
        as if rivers wouldn&rsquo;t be the best way to demarcate borders.
        However such movement, paradoxically, generates the conditions that are
        used to justify the application of force over it — the operational
        regimes that reinforce the river as an artificial limit.
      </div>

      {/* Instructions */}
      <div className="mt-8 indent-10 uppercase">Instructions</div>
      <ol className="mt-4 list-outside list-decimal pl-5">
        <li className="mt-4">
          Use the arrow keys (or WASD) to move around the models.
        </li>
        <li className="mt-4">
          Click on the 360° button to use your mouse pad and freely navigate.
        </li>
        <li className="mt-4">
          Press &lsquo;ESC&rsquo; to leave the 360° view.
        </li>
        <li className="mt-4">
          Explore different locations across the river using the buttons at the
          top of the landscape view.
        </li>
        <li className="mt-4">
          Increase and decrease the erosion and accretion values using the
          buttons at the top of the mesh view.
        </li>
      </ol>

      {/* The Simulator */}
      <div className="mt-8 indent-10 uppercase">The Simulator</div>
      <div className="mt-4">
        This computer program approximates a set of coupled
        hydrological-geomorphological equations using numerical methods defined
        on a {gridSize} grid (or {numCells} individual cells). It attempts to
        map the geomorphological evolution of sections of the river using a
        cellular automaton: a set of computational rules. Together, these
        determine large-scale landform change when run in parallel over time.
      </div>
      <div className="mt-4">
        Cells are either wet or dry. Wet cells track the height of the column of
        water they contain. This number, essentially the water depth, determines
        their capacity to erode or accrete sediment, as well as the carrying
        capacity of the water to move sediment downstream.
      </div>
      <div className="mt-4">
        Erosion and accretion speeds are the two parameters that govern the
        evolution of the river and control how quickly, on average, sediment is
        either removed from or accumulated in each grid cell during the
        simulation. These values interact with the velocity of the water and
        with a cross-stream curvature gradient estimate unique to each cell to
        calculate the qualities of the grid at a cellular scale.
      </div>
      <div className="mt-4">
        The source code for this simulator is freely available{" "}
        <a
          className="border-b"
          target="_blank"
          href="https://github.com/nicschumann/many-rivers"
        >
          here
        </a>
        .
      </div>

      {/* Credits */}
      <div className="mt-8 indent-10 uppercase">Credits</div>
      <div className="mt-4">
        This project was conceptualized and directed by Federico Pérez Villoro.
      </div>
      <div className="mt-4">
        The creative and technical development of the computational model and
        website application was undertaken by Nic Schumann. Lukas WinklerPrins
        consulted on the mathematics behind the model and on the hydro- and
        morpho-dynamics.
      </div>
      <div className="mt-4">
        Major support for the development of All Possible Rivers was provided by
        the Goethe Institut and Gray Area in San Francisco as part of their 2023
        C/Change Creative Research and Development Lab. Research towards this
        project was also possible thanks to the generous support of Fundación
        Jumex Arte Contemporáneo.
      </div>

      {/* Disclaimer */}
      <div className="mt-8 indent-10 uppercase">Disclaimer</div>
      <div className="mt-4">
        The website is fairly resource intensive and might slow down other
        activities on your browser and machine. It requires a recent computer
        with a capable WebGL graphics card to run. It is only designed to work
        on desktop computers.
      </div>
    </>
  );
}
