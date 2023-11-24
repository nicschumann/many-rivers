import { River } from "@/simulation/data/rivers";
import OverlayButton from "../OverlayButton/OverlayButton";
import PointerLockButton from "../PointerLockButton/PointerLockButton";
import { TILE_SIZE } from "@/simulation/constants";
import { useState } from "react";

interface FooterRowProps {
  t: number;
  w: number;
  river: River;
  isRunning: boolean;
  setRunning: (isRunning: boolean) => void;
  openModal: () => void;
}

const formatAsSteps = (t: number): string => {
  return `${t.toFixed(0)} steps`;
};

const formatAsLatLong = (t: [number, number]): string => {
  return `${t[0].toFixed(5)}, ${t[1].toFixed(5)}`;
};

const formatAsVolume = (w: number): string => {
  const d = TILE_SIZE.reduce((a, b) => a * b, 1) - w;

  return `${Math.round(w).toLocaleString("es-MX")} wet / ${d.toLocaleString(
    "es-MX"
  )} dry`;
};

export default function FooterRow({
  t,
  w,
  river,
  isRunning,
  setRunning,
  openModal,
}: FooterRowProps) {
  const [cameraIsActive, setCameraIsActive] = useState(false);

  const instructionText = cameraIsActive
    ? "Press 'ESC' to leave 360° view"
    : "Navigate using the arrow keys (or WASD)";

  return (
    <div className="flex mt-auto w-full items-left">
      <div className="flex">
        <div onClick={openModal}>
          <OverlayButton>
            <span>Info</span>
          </OverlayButton>
        </div>
      </div>
      <div className="mr-auto flex text-left uppercase">
        <div className="px-10 py-1">{formatAsLatLong(river.coordinates)} </div>
        <div className="pr-10 py-1">{formatAsVolume(w)} </div>
        <div className="pr-10 py-1">{formatAsSteps(t)}</div>

        {/* <div className="text-white ml-2">Test</div> */}
      </div>
      <div className="flex text-left uppercase">
        <div className="px-10 py-1">{instructionText}</div>
      </div>
      <PointerLockButton
        pointerIsLocked={cameraIsActive}
        setPointerIsLocked={setCameraIsActive}
        className="ml-auto"
      />
      {/* <div onClick={() => setRunning(!isRunning)} className="w-32 text-right">
        <OverlayButton>
          {isRunning ? <span>Pause</span> : <span>Run</span>}
        </OverlayButton>
      </div> */}
    </div>
  );
}