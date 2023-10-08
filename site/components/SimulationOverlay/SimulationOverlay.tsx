"use client";

import { UIOverlayState, useApplicationState } from "@/store";
import OverlayButton from "../OverlayButton/OverlayButton";
import { classNames } from "@/utils";
import { useEffect, useState } from "react";
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";
import { rivers, River } from "@/simulation/data/rivers";
import Link from "next/link";
import DroneViewOverlay from "../DroneViewOverlay/DroneViewOverlay";
import SimulationToolsOverlay from "../SimulationToolsOverlay/SimulationToolsOverlay";

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
  const [overlayVisible, setOverlayVisible] = useState(true);
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
      {isLoaded && activeOverlay == UIOverlayState.DroneView && (
        <DroneViewOverlay river={river} nextRiver={nextRiver} t={t} w={w} />
      )}
      {isLoaded && activeOverlay == UIOverlayState.SimTools && (
        <SimulationToolsOverlay river={river} />
      )}
      {!isLoaded && <LoadingOverlay />}
    </>
  );
}
