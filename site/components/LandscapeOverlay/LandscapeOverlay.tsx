"use client";

import { UIOverlayState, useApplicationState } from "@/store";
import OverlayButton from "../OverlayButton/OverlayButton";
import { classNames } from "@/utils";
import { River, rivers } from "@/simulation/data/rivers";
import Link from "next/link";
import PointerLockButton from "../PointerLockButton/PointerLockButton";
import RiverLocations from "../RiverLocations/RiverLocations";
import FooterRow from "../FooterRow/FooterRow";

interface DroneViewOverlayProps {
  river: River;
  nextRiver: River;
  t: number;
  w: number;
}

export default function DroneViewOverlay({
  river,
  nextRiver,
  t,
  w,
}: DroneViewOverlayProps) {
  const isRunning = useApplicationState((s) => s.sim.state.running);
  const setRunning = useApplicationState((s) => {
    return (running: boolean) => {
      s.setSimState({ running });
    };
  });

  const setOverlayState = useApplicationState((s) => {
    return (newOverlayState: UIOverlayState) => {
      s.setUIState({ active_overlay: newOverlayState });
    };
  });

  return (
    <div
      className={classNames(
        "z-10 absolute top-0 bg-transparent h-full w-full p-6 flex flex-wrap text-white text-sm"
      )}
    >
      <div className="flex w-full items-left">
        <div className="">
          <OverlayButton>
            <Link href={`/rivers/${nextRiver.slug}`}>River</Link>
          </OverlayButton>
        </div>
        {/* Locations overlay... */}
        <RiverLocations currentSlug={river.slug} />
        <PointerLockButton className="ml-auto" />
        <div
          className="ml-2"
          onClick={() => setOverlayState(UIOverlayState.SimulationView)}
        >
          <OverlayButton>
            <span>Simulation</span>
          </OverlayButton>
        </div>
      </div>

      <FooterRow
        river={river}
        t={t}
        w={w}
        isRunning={isRunning}
        setRunning={setRunning}
      />
    </div>
  );
}
