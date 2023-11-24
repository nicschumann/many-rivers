"use client";

import {
  UIOverlayState,
  UIOverlayVisibility,
  useApplicationState,
} from "@/store";
import OverlayButton from "../OverlayButton/OverlayButton";
import { classNames } from "@/utils";
import { useState } from "react";
import { River } from "@/simulation/data/rivers";
import FooterRow from "../FooterRow/FooterRow";
import ModalOverlay from "../ModalOverlay/ModalOverlay";
import ProjectDescription from "../ProjectDescription/ProjectDescription";

interface SimulationToolsOverlayProps {
  t: number;
  w: number;
  river: River;
}

export default function SimulationToolsOverlay({
  river,
  t,
  w,
}: SimulationToolsOverlayProps) {
  const [infoModalIsOpen, setInfoModalIsOpen] = useState(false);

  const [wasRunning, setWasRunning] = useState(false);

  const overlayVisibility = useApplicationState((s) => s.ui.overlay_visibility);
  const setOverlayVisibility = useApplicationState((s) => {
    return (newState: UIOverlayVisibility) => {
      s.setUIState({ overlay_visibility: newState });
    };
  });

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

  const openModal = () => {
    setWasRunning(isRunning);
    setRunning(false);
    setInfoModalIsOpen(true);
    setOverlayVisibility(UIOverlayVisibility.Overlay);
  };

  const closeModal = () => {
    setInfoModalIsOpen(false);
    setRunning(wasRunning);
    setOverlayVisibility(UIOverlayVisibility.Complete);
  };

  return (
    <div
      className={classNames(
        "z-10 absolute top-0 bg-transparent h-full w-full p-6 flex flex-wrap text-white text-sm"
      )}
    >
      {overlayVisibility === UIOverlayVisibility.Complete && (
        <div className="flex w-full h-8 items-left">
          <div className="">
            <OverlayButton>
              <span className="uppercase">glossary</span>
            </OverlayButton>
          </div>
          <div
            onClick={() => setOverlayState(UIOverlayState.LandscapeView)}
            className="ml-auto"
          >
            <OverlayButton>
              <span className="uppercase">landscape</span>
            </OverlayButton>
          </div>
        </div>
      )}

      <FooterRow
        river={river}
        t={t}
        w={w}
        isRunning={isRunning}
        setRunning={setRunning}
        openModal={openModal}
      />
      {infoModalIsOpen && (
        <ModalOverlay closeModal={closeModal}>
          <ProjectDescription />
        </ModalOverlay>
      )}
    </div>
  );
}
