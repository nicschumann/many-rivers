import { Dispatch, SetStateAction, useEffect } from "react";
import OverlayButton from "../OverlayButton/OverlayButton";

import * as input from "@/simulation/inputs";

interface PointerLockButton {
  className: string;
  pointerIsLocked: boolean;
  setPointerIsLocked: Dispatch<SetStateAction<boolean>>;
}

export default function PointerLockButton({
  className,
  pointerIsLocked,
  setPointerIsLocked,
}: PointerLockButton) {
  useEffect(() => {
    if (pointerIsLocked) {
      const intervalId = setInterval(() => {
        const currentPointerState = document.pointerLockElement !== null;
        if (!currentPointerState) setPointerIsLocked((s) => false);
      }, 250);

      return () => clearInterval(intervalId);
    }
  }, [pointerIsLocked, setPointerIsLocked]);

  return (
    <div
      onClick={() => {
        let c = document.querySelectorAll("canvas");
        if (c.length == 1) {
          c[0].requestPointerLock();
          setPointerIsLocked(true);
        }
      }}
      className={className}
    >
      <OverlayButton>
        <span>360°</span>
      </OverlayButton>
    </div>
  );
}
