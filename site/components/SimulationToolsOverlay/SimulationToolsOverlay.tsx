"use client";

import { UIOverlayState, useApplicationState } from "@/store";
import OverlayButton from "../OverlayButton/OverlayButton";
import { classNames } from "@/utils";
import { useState } from "react";
import { River } from "@/simulation/data/rivers";
import PointerLockButton from "../PointerLockButton/PointerLockButton";
import FooterRow from "../FooterRow/FooterRow";
import ModalOverlay from "../ModalOverlay/ModalOverlay";

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
  const [nextRiver, setNextRiver] = useState<River>(river);
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
      <div className="flex w-full items-left">
        <PointerLockButton className="ml-auto" />
        <div
          onClick={() => setOverlayState(UIOverlayState.LandscapeView)}
          className="ml-2"
        >
          <OverlayButton>
            <span>LANDSCAPE</span>
          </OverlayButton>
        </div>
      </div>

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
    </div>
  );
}
