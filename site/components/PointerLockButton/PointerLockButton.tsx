import { Dispatch, SetStateAction, useEffect } from "react";
import OverlayButton from "../OverlayButton/OverlayButton";

import * as input from "@/simulation/inputs";
import {
  UIOverlayState,
  UIOverlayVisibility,
  useApplicationState,
} from "@/store";

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
  const setOverlayVisibility = useApplicationState((s) => {
    return (newState: UIOverlayVisibility) => {
      s.setUIState({ overlay_visibility: newState });
    };
  });

  useEffect(() => {
    if (pointerIsLocked) {
      const intervalId = setInterval(() => {
        const currentPointerState = document.pointerLockElement !== null;
        if (!currentPointerState) {
          setPointerIsLocked((s) => false);
          setOverlayVisibility(UIOverlayVisibility.Complete);
        }
      }, 250);

      return () => clearInterval(intervalId);
    }
    // eslint-disable-next-line
  }, [pointerIsLocked, setPointerIsLocked]);
  /**
   * NOTE(Nic): the array above INTENTIONALLY excludes setOverlayVisibility;
   * including it breaks the state updating.
   */

  return (
    <div
      onClick={() => {
        let c = document.querySelectorAll("canvas");
        if (c.length == 1) {
          c[0].requestPointerLock();
          setPointerIsLocked(true);
          setOverlayVisibility(UIOverlayVisibility.Freelook);
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
