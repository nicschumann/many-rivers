import { River } from "@/simulation/data/rivers";
import OverlayButton from "../OverlayButton/OverlayButton";
import PointerLockButton from "../PointerLockButton/PointerLockButton";
import { TILE_SIZE } from "@/simulation/constants";
import { useState } from "react";
import {
  CameraAnimationType,
  UIOverlayVisibility,
  useApplicationState,
} from "@/store";
import { classNames } from "@/utils";

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

  return `${Math.round(w).toLocaleString(
    "es-MX"
  )} wet cells / ${d.toLocaleString("es-MX")} dry cells`;
};

export default function FooterRow({ t, w, river, openModal }: FooterRowProps) {
  const [cameraIsActive, setCameraIsActive] = useState(false);
  const overlayVisibility = useApplicationState((s) => s.ui.overlay_visibility);
  const camState = useApplicationState((s) => s.cam);
  const setCamState = useApplicationState((s) => s.setCamState);

  const instructionText = cameraIsActive
    ? "Press 'ESC' to leave 360° view"
    : "Navigate using the arrow keys (or WASD)";

  const shouldHideButtons =
    cameraIsActive || overlayVisibility !== UIOverlayVisibility.Complete;
  const shouldHideMetadata = overlayVisibility === UIOverlayVisibility.Overlay;

  return (
    <div className="flex mt-auto w-full items-left">
      <div className={classNames(shouldHideButtons ? "invisible" : "", "flex")}>
        <div onClick={openModal}>
          <OverlayButton>
            <span>Info</span>
          </OverlayButton>
        </div>
      </div>
      <div className="mr-auto flex text-left uppercase">
        <div
          className={classNames(
            shouldHideMetadata ? "invisible" : "",
            "px-10 py-1"
          )}
        >
          {formatAsLatLong(river.coordinates)}{" "}
        </div>
        <div
          className={classNames(
            shouldHideMetadata ? "invisible" : "",
            "pr-10 py-1"
          )}
        >
          {formatAsVolume(w)}{" "}
        </div>
        <div
          className={classNames(shouldHideMetadata ? "invisible" : "", " py-1")}
        >
          {formatAsSteps(t)}
        </div>

        {/* <div className="text-white ml-2">Test</div> */}
      </div>
      <div
        className={classNames(
          shouldHideMetadata ? "invisible" : "",
          "flex text-left uppercase"
        )}
      >
        <div className="px-10 py-1">{instructionText}</div>
      </div>

      {/* Camera Control Buttons */}
      <div
        onClick={() => {
          if (!camState.requested) {
            setCamState({
              type: CameraAnimationType.Top,
              requested: true,
            });
          }
        }}
        className={classNames(
          shouldHideButtons ? "invisible" : "",
          camState.requested ? "opacity-50" : "",
          "text-left uppercase ml-auto mr-2"
        )}
      >
        <OverlayButton>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5 -mx-1"
          >
            <polyline points="4 8 4 4 8 4" />
            <polyline points="16 4 20 4 20 8" />
            <polyline points="20 16 20 20 16 20" />
            <polyline points="8 20 4 20 4 16" />
          </svg>
        </OverlayButton>
      </div>

      <div
        onClick={() => {
          if (!camState.requested) {
            setCamState({
              type: CameraAnimationType.Perspective,
              requested: true,
            });
          }
        }}
        className={classNames(
          shouldHideButtons ? "invisible" : "",
          camState.requested ? "opacity-50" : "",
          "text-left uppercase mr-2"
        )}
      >
        <OverlayButton>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5 -mx-1"
          >
            <polyline points="12 8 16 8 16 12" />
            <polyline points="20 19 4 19 4 4" />
            <line x1="4" y1="19" x2="16" y2="8" />
          </svg>
        </OverlayButton>
      </div>

      <PointerLockButton
        pointerIsLocked={cameraIsActive}
        setPointerIsLocked={setCameraIsActive}
        className={classNames(shouldHideButtons ? "invisible" : "", "")}
      />
      {/* <div onClick={() => setRunning(!isRunning)} className="w-32 text-right">
        <OverlayButton>
          {isRunning ? <span>Pause</span> : <span>Run</span>}
        </OverlayButton>
      </div> */}
    </div>
  );
}
