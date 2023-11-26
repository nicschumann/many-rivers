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
import ControlsRow from "../ControlsRow/ControlsRow";
import ProjectGlossary from "../ProjectGlossary/ProjectGlossary";
import Link from "next/link";

interface SimulationToolsOverlayProps {
  t: number;
  w: number;
  river: River;
  nextRiver: River;
}

export default function SimulationToolsOverlay({
  river,
  nextRiver,
  t,
  w,
}: SimulationToolsOverlayProps) {
  const [infoModalIsOpen, setInfoModalIsOpen] = useState(false);
  const [glossaryModalIsOpen, setGlossaryModelIsOpen] = useState(false);

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

  const openInfoModal = () => {
    setWasRunning(isRunning);
    setRunning(false);
    setInfoModalIsOpen(true);
    setOverlayVisibility(UIOverlayVisibility.Overlay);
  };

  const closeInfoModal = () => {
    setInfoModalIsOpen(false);
    setRunning(wasRunning);
    setOverlayVisibility(UIOverlayVisibility.Complete);
  };

  const openGlossaryModal = () => {
    setWasRunning(isRunning);
    setRunning(false);
    setGlossaryModelIsOpen(true);
    setOverlayVisibility(UIOverlayVisibility.Overlay);
  };

  const closeGlossaryModal = () => {
    setGlossaryModelIsOpen(false);
    setRunning(wasRunning);
    setOverlayVisibility(UIOverlayVisibility.Complete);
  };

  return (
    <>
      <div
        className={classNames(
          "z-10 absolute top-0 bg-transparent h-full w-full p-6 flex flex-wrap text-white text-sm"
        )}
      >
        {overlayVisibility === UIOverlayVisibility.Complete && (
          <div className="flex w-full h-8 items-left">
            <div className="">
              <OverlayButton>
                <Link href={`/rivers/${nextRiver.slug}`}>New&nbsp;River</Link>
              </OverlayButton>
            </div>
            <ControlsRow className="" />
            <div onClick={() => setOverlayState(UIOverlayState.LandscapeView)}>
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
          openModal={openInfoModal}
        />
      </div>
      {infoModalIsOpen && (
        <ModalOverlay closeModal={closeInfoModal}>
          <ProjectDescription />
        </ModalOverlay>
      )}
      {glossaryModalIsOpen && (
        <ModalOverlay closeModal={closeGlossaryModal}>
          <ProjectGlossary />
        </ModalOverlay>
      )}
    </>
  );
}
