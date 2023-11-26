"use client";

import SimulationOverlay from "@/components/SimulationOverlay/SimulationOverlay";
import SimulationRoot from "@/components/SimulationRoot/SimulationRoot";
import { rivers } from "@/simulation/data/rivers";
import { AnimationState } from "@/store";
import { useState } from "react";

export default function River({ params }: { params: { name: string } }) {
  const [t, setT] = useState(0); // timestep
  const [w, setW] = useState(0); // cubic meters of water

  const river_id = params.name;

  if (typeof rivers[river_id] == "undefined") {
    /**
     * NOTE(Nic): no such river – we need to redirect to a 404
     * page, or otherwise do something to redirec to a working river.
     */
    return (
      <main className="relative h-screen w-screen">
        <SimulationOverlay river={rivers[river_id]} t={0} w={0} />
      </main>
    );
  }

  return (
    <main className="relative h-screen w-screen bg-black">
      <SimulationRoot river={rivers[river_id]} setT={setT} setW={setW} />
      <SimulationOverlay river={rivers[river_id]} t={t} w={w} />
    </main>
  );
}
