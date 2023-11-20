import { River } from "@/simulation/data/rivers";
import OverlayButton from "../OverlayButton/OverlayButton";

interface FooterRowProps {
  t: number;
  w: number;
  river: River;
  isRunning: boolean;
  setRunning: (isRunning: boolean) => void;
  openModal: () => void;
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

export default function FooterRow({
  t,
  w,
  river,
  isRunning,
  setRunning,
  openModal,
}: FooterRowProps) {
  return (
    <div className="flex mt-auto w-full items-left">
      <div className="flex mr-auto">
        <div onClick={openModal}>
          <OverlayButton>
            <span>Info</span>
          </OverlayButton>
        </div>
      </div>
      <div className="ml-auto flex text-right">
        <div className="px-10 py-1">{formatAsLatLong(river.coordinates)} </div>
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
  );
}
