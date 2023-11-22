"use client";

import { UIOverlayState, useApplicationState } from "@/store";
import OverlayButton from "../OverlayButton/OverlayButton";
import { classNames } from "@/utils";
import { River, rivers } from "@/simulation/data/rivers";
import Link from "next/link";
import PointerLockButton from "../PointerLockButton/PointerLockButton";
import RiverLocations from "../RiverLocations/RiverLocations";

interface DroneViewOverlayProps {
  river: River;
  nextRiver: River;
  t: number;
  w: number;
}

const formatAsYears = (t: number): string => {
  return `${t.toFixed(0)} steps`;
};

const formatAsLatLong = (t: [number, number]): string => {
  return `${t[0].toFixed(5)}, ${t[1].toFixed(5)}`;
};

const formatAsVolume = (w: number): string => {
  return `${Math.round(w).toLocaleString("es-MX")} / ${(
    512 * 512
  ).toLocaleString("es-MX")} cells`;
};

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
          onClick={() => setOverlayState(UIOverlayState.SimTools)}
        >
          <OverlayButton>
            <span>Tools</span>
          </OverlayButton>
        </div>
      </div>

      <div className="flex mt-auto w-full items-left">
        <div className="text-[#ff0000] flex mr-auto">
          <div>
            <OverlayButton>
              <span>Info</span>
            </OverlayButton>
          </div>
        </div>
        <div className="ml-auto flex text-right">
          <div className="px-10 py-1">
            {formatAsLatLong(river.coordinates)}{" "}
          </div>
          <div className="px-10 py-1">{formatAsVolume(w)} </div>
          <div className="px-10 py-1">{formatAsYears(t)}</div>

          {/* <div className="text-white ml-2">Test</div> */}
        </div>
        <div onClick={() => setRunning(!isRunning)} className="w-32 text-right">
          <OverlayButton>
            {isRunning ? <span>Pause</span> : <span>Run</span>}
          </OverlayButton>
        </div>
      </div>
    </div>
  );
}
