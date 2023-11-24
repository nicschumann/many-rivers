import { TILE_SIZE } from "@/simulation/constants";

export default function ProjectGlossary() {
  const gridSize = `${TILE_SIZE[0]} × ${TILE_SIZE[1]}`;
  const numCells = (TILE_SIZE[0] * TILE_SIZE[1]).toLocaleString("es-MX");

  return (
    <>
      {/* Description */}
      <div className="indent-10 uppercase">The Simulator</div>
      <div className="">
        This computer program approximates a set of coupled
        hydrological-geomorphological equations using numerical methods defined
        on a {gridSize} grid (or {numCells} individual cells). It attempts to
        map the future geomorphology of Rio Grande / Río Bravo using a cellular
        automaton: a set of relatively simple, locally-defined computational
        rules. Together, these determine large-scale landform change when run in
        parallel over a long period of time.
      </div>
      <div className="indent-10">
        Nic Schumann and Lukas WinklerPrins collaborated to design the
        simulator: Nic handled the programming, GPU parallelization, iteration,
        and testing, while Lukas provided the differential equations and
        additional testing.
      </div>
      <div className="indent-10">
        Many of the mechanics in this simulation take inspiration from &ldquo;A
        Cellular Model of River Meandering,&rdquo; by Tom J. Coulthard and Marco
        J. Van De Wiel, 2006. We appreciate the paper and the ability to take a
        peek at their larger model&rsquo;s source code, which is freely
        available to all. Our source code is also freely available{" "}
        <a
          className="border-b"
          target="_blank"
          href="https://github.com/nicschumann/many-rivers"
        >
          here
        </a>
        .
      </div>
      <div className="indent-10">
        Note that as with all computational models, ours is a very simplified
        cartoon of the actual geomorphological processes dictated by physics.
        Proceed with caution.
      </div>
      <div className="mt-8 indent-10 uppercase">Parameters</div>
      <div className="">
        Two key parameters govern the evolution of the river: erosion speed and
        accretion speed. You can increase and decrease their values using the
        buttons at the top of the mesh view.
      </div>
      <div className="flex mt-8 uppercase">
        <div>Name</div>
        <div className="ml-auto w-[75%]">Description</div>
      </div>
      <div className="border-b border-white mt-4"></div>
      <div className="flex mt-4">
        <div>Water Depth</div>
        <div className="ml-auto w-[75%]">
          Each cell is either wet or dry. Wet cells track the height of the
          column of water they contain. This number, essentially the water
          depth, determines the capacity of each cell to erode or accrete
          sediment, as well as the carrying capacity of the water to move
          sediment downstream.
        </div>
      </div>
      <div className="flex mt-4">
        <div>Erosion / Accretion</div>
        <div className="ml-auto w-[75%]">
          Erosion and Accretion speeds are two numbers that controls how
          quickly, on average, sediment is either removed from or accumulated in
          in each grid cell of the simulation. This number is multiplied by the
          velocity of the water and a cross-stream curvature gradient estimate
          unique to each cell to determine the actual erosion quantity in each
          of the {numCells} cells.
        </div>
      </div>
    </>
  );
}
