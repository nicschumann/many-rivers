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
import PointerLockButton from "../PointerLockButton/PointerLockButton";
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
  const [modalIsOpen, setModalIsOpen] = useState(false);

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
    setModalIsOpen(true);
    setOverlayVisibility(UIOverlayVisibility.Overlay);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setRunning(wasRunning);
    setOverlayVisibility(UIOverlayVisibility.Complete);
  };

  const renderState = useApplicationState((s) => {
    return {
      hydroynamics: s.ui.render_flux,
      sediment: s.ui.render_erosion_accretion,
      curvature: s.ui.render_curvature,
    };
  });

  return (
    <div
      className={classNames(
        "z-10 absolute top-0 bg-transparent h-full w-full p-6 flex flex-wrap text-white text-sm"
      )}
    >
      {overlayVisibility === UIOverlayVisibility.Complete && (
        <div className="flex w-full h-8 items-left">
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

      {/* <div className="flex mt-auto w-full items-left">
        <div className="divide-y border w-96 border-white text-[#ff0000] rounded-lg">
          <div className="flex">
            <div className="m-2">Erosion Speed</div>
            <div className="ml-auto flex">
              <div className="m-2 hover:border-b cursor-pointer">Slow</div>
              <div className="m-2 hover:border-b border-b">Medium</div>
              <div className="m-2 hover:border-b">Fast</div>
            </div>
          </div>
          <div className="flex">
            <div className="m-2">Erosion Threshold</div>
            <div className="ml-auto flex">
              <div className="m-2 hover:border-b">Low</div>
              <div className="m-2 hover:border-b border-b">Normal</div>
              <div className="m-2 hover:border-b">High</div>
            </div>
          </div>
          <div className="flex">
            <div className="m-2">Accretion Speed</div>
            <div className="ml-auto flex">
              <div className="m-2 hover:border-b">Slow</div>
              <div className="m-2 hover:border-b border-b">Medium</div>
              <div className="m-2 hover:border-b">Fast</div>
            </div>
          </div>
          <div className="flex">
            <div className="m-2">Accretion Threshold</div>
            <div className="ml-auto flex">
              <div className="m-2 hover:border-b">Low</div>
              <div className="m-2 hover:border-b border-b">Normal</div>
              <div className="m-2 hover:border-b">High</div>
            </div>
          </div>
        </div>
      </div> */}

      <FooterRow
        river={river}
        t={t}
        w={w}
        isRunning={isRunning}
        setRunning={setRunning}
        openModal={openModal}
      />
      {modalIsOpen && (
        <ModalOverlay closeModal={closeModal}>
          <ProjectDescription />
        </ModalOverlay>
      )}
    </div>
  );
}
