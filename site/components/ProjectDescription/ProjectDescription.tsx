export default function ProjectDescription() {
  return (
    <>
      {/* Description */}
      <div className="mt-8 indent-10">Project Description</div>
      <div className="mt-8 indent-10">
        The project consists of a computational model that aims to anticipate
        the future geomorphology of the Rio Grande / Río Bravo and, with it, of
        the U.S.-Mexico border. Taking into account the physics that participate
        in the large-scale evolution of the river, the program generates
        speculative landscapes by simulating complex interactions between water
        and land in specific places and across geological temporalities.
      </div>
      <div className="mt-8 indent-10">
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
      <div className="mt-8 indent-10">
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

      {/* Disclaimer */}
      <div className="mt-8 indent-10">Technical Disclaimer</div>
      <div className="mt-8 indent-10">
        The website is fairly resource intensive and might slow down other
        activities on your browser and machine. It requires a recent computer
        with a capable WebGL graphics card to run. It is only designed to work
        on desktop computers.
      </div>

      {/* Instructions */}
      <div className="mt-8 indent-10">Instructions</div>
      <div className="mt-8 indent-10">
        <ul>
          <li>
            Each time you enter the website a new river loads with randomized
            parameters.
          </li>
          <li>
            Use the arrow keys (or WASD) and mouse pad to navigate and zoom in
            and out.{" "}
          </li>
          <li>Select different locations across the river using the map.</li>
          <li>
            Interact with the model&rsquo;s hydrological variables by clicking
            on the tools view.
          </li>
          <li>
            The soundscape is programmatic. You can interact with it moving
            around the space and by way of the simulator&rsquo;s own
            interactions.
          </li>
        </ul>
      </div>

      {/* Credits */}
      <div className="mt-8 indent-10">Credits</div>
      <div className="mt-8 indent-10">
        This project was conceptualized and directed by Federico Pérez Villoro.
        The creative and technical development of the computational model and
        website application was undertaken by Nic Schumann. Lukas WinklerPrins
        consulted on the mathematical simulation and hydrology parameters.
      </div>
      <div className="mt-8 indent-10">
        Major support for the development of All Possible Rivers was provided by
        the Goethe Institut and Gray Area in San Francisco as part of their 2023
        C/Change Creative Research and Development Lab. Research towards this
        project was also possible thanks to the generous support of Fundación
        Jumex Arte Contemporáneo.
      </div>
    </>
  );
}
