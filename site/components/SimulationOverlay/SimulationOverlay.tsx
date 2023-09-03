'use client'

import { useApplicationState } from "@/store";
import OverlayButton from "../OverlayButton/OverlayButton";
import { classNames } from "@/utils";

export default function SimulationOverlay() {

    let isLoaded = useApplicationState(s => s.sim.state.loaded)

    return (
        <div className={classNames(
            isLoaded ? 'bg-transparent' : 'bg-black',
            "z-10 absolute top-0  h-full w-full p-6 flex flex-wrap"
        )}>
            {isLoaded && <div className="flex w-full items-left">
                <div className=""><OverlayButton>New River</OverlayButton></div>
                <div className="ml-auto"><OverlayButton>Simulation Tools</OverlayButton></div>
            </div>}

            {isLoaded && <div className="flex mt-auto w-full items-left">
                <div className=""><OverlayButton>New River</OverlayButton></div>
                <div className="ml-auto"><OverlayButton>Simulation Tools</OverlayButton></div>
            </div>}
        </div>
    )
}
 