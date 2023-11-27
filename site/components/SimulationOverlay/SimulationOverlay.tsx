"use client";

import { UIOverlayState, useApplicationState } from "@/store";
import { useEffect, useState } from "react";
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";
import { rivers, River } from "@/simulation/data/rivers";
import LandscapeOverlay from "../LandscapeOverlay/LandscapeOverlay";
import SimulationToolsOverlay from "../SimulationToolsOverlay/SimulationToolsOverlay";
import SmallScreenWarning from "../SmallScreenWarning/SmallScreenWarning";

interface SimulationOverlayProps {
  river: River;
  t: number;
  w: number;
}

export default function SimulationOverlay({
  river,
  t = 0,
  w = 0,
}: SimulationOverlayProps) {
  const [nextRiver, setNextRiver] = useState<River>(river);
  const isLoaded = useApplicationState((s) => s.sim.state.loaded);
  const activeOverlay = useApplicationState((s) => s.ui.active_overlay);

  useEffect(() => {
    const otherRivers = Object.values(rivers).filter(
      (r) => r.slug !== river.slug
    );
    const otherRiver =
      otherRivers[Math.floor(Math.random() * otherRivers.length)];

    setNextRiver(otherRiver);
  }, [river.slug]);

  return (
    <>
      {isLoaded && activeOverlay == UIOverlayState.LandscapeView && (
        <LandscapeOverlay river={river} nextRiver={nextRiver} t={t} w={w} />
      )}
      {isLoaded && activeOverlay == UIOverlayState.SimulationView && (
        <SimulationToolsOverlay
          river={river}
          nextRiver={nextRiver}
          t={t}
          w={w}
        />
      )}
      {!isLoaded && <LoadingOverlay />}
      <SmallScreenWarning />
    </>
  );
}
