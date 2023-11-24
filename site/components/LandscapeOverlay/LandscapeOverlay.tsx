"use client";

import {
  UIOverlayState,
  UIOverlayVisibility,
  useApplicationState,
} from "@/store";
import OverlayButton from "../OverlayButton/OverlayButton";
import { classNames } from "@/utils";
import { River } from "@/simulation/data/rivers";
import Link from "next/link";
import RiverLocations from "../RiverLocations/RiverLocations";
import FooterRow from "../FooterRow/FooterRow";
import ModalOverlay from "../ModalOverlay/ModalOverlay";
import { useState } from "react";
import ProjectDescription from "../ProjectDescription/ProjectDescription";

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
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [wasRunning, setWasRunning] = useState(false);
  const isRunning = useApplicationState((s) => s.sim.state.running);
  const setRunning = useApplicationState((s) => {
    return (running: boolean) => {
      s.setSimState({ running });
    };
  });

  const overlayVisibility = useApplicationState((s) => s.ui.overlay_visibility);
  const setOverlayVisibility = useApplicationState((s) => {
    return (newState: UIOverlayVisibility) => {
      s.setUIState({ overlay_visibility: newState });
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
            {/* Locations overlay... */}
            <RiverLocations currentSlug={river.slug} />
            <div
              className="ml-2"
              onClick={() => setOverlayState(UIOverlayState.SimulationView)}
            >
              <OverlayButton>
                <span>Mesh</span>
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
      </div>
      {modalIsOpen && (
        <ModalOverlay closeModal={closeModal}>
          <ProjectDescription />
        </ModalOverlay>
      )}
    </>
  );
}
