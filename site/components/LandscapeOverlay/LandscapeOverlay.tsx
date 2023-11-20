"use client";

import { UIOverlayState, useApplicationState } from "@/store";
import OverlayButton from "../OverlayButton/OverlayButton";
import { classNames } from "@/utils";
import { River, rivers } from "@/simulation/data/rivers";
import Link from "next/link";
import PointerLockButton from "../PointerLockButton/PointerLockButton";
import RiverLocations from "../RiverLocations/RiverLocations";
import FooterRow from "../FooterRow/FooterRow";
import ModalOverlay from "../ModalOverlay/ModalOverlay";
import { useState } from "react";

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

  const setOverlayState = useApplicationState((s) => {
    return (newOverlayState: UIOverlayState) => {
      s.setUIState({ active_overlay: newOverlayState });
    };
  });

  const openModal = () => {
    setWasRunning(isRunning);
    setRunning(false);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setRunning(wasRunning);
  };

  return (
    <>
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
            onClick={() => setOverlayState(UIOverlayState.SimulationView)}
          >
            <OverlayButton>
              <span>Simulation</span>
            </OverlayButton>
          </div>
        </div>

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
          <div className="mt-8 indent-10">Project Description</div>
          <div className="mt-8 indent-10">
            The project consists of a computational model that aims to
            anticipate the future geomorphology of the Rio Grande / Río Bravo
            and, with it, of the U.S.-Mexico border. Taking into account the
            physics that participate in the large-scale evolution of the river,
            the program generates speculative landscapes by simulating complex
            interactions between water and land in specific places and across
            geological temporalities.
          </div>
          <div className="indent-10">
            A pipeline of several computational steps calculates the capacities
            of water to erode land and of land to accumulate sediments. As the
            river&rsquo;s waters push towards the inside of its meanders, the
            outer bends smooth out, generating an intensifying feedback loop
            that results in geometric transformations. The shape of the
            simulated rivers evolve over time using a dense grid of
            computational cells with locally-defined rules. The volume of water
            in each cell changes in response to the gradients of land and water
            surrounding it — carrying materials into or away from it. The flows
            of these materials affect such gradients where water determines
            where sediments concentrate while land affects water behaviors.
          </div>
          <div className="indent-10">
            Using topographic scans from the US Geological Survey, the simulator
            explores the ever-changing course of the river as a border
            technology. The border expands and contracts permanently. It is
            dynamically renegotiated where each act of measurement allows for
            the recalibration of the authority exercised over it. Given its
            instability, it would seem as if rivers wouldn&rsquo;t be the best
            way to demarcate borders. However such movement, paradoxically,
            generates the conditions that are used to justify the application of
            force over it — the operational regimes that reinforce the river as
            an artificial limit.
          </div>
        </ModalOverlay>
      )}
    </>
  );
}
