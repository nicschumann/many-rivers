'use client'

import { useApplicationState } from "@/store";
import OverlayButton from "../OverlayButton/OverlayButton";
import { classNames } from "@/utils";
import { useState } from "react";
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";
import { River } from "@/simulation/data/rivers";

interface SimulationOverlayProps {
    river: River
}

export default function SimulationOverlay({ river }: SimulationOverlayProps) {
    const [ overlayVisible, setOverlayVisible ] = useState(true)

    let isLoaded = useApplicationState(s => s.sim.state.loaded)
    let isRunning = useApplicationState(s => s.sim.state.running)

    return (
        <>
            {isLoaded && <div className={classNames(
                isLoaded ? 'bg-transparent' : 'bg-black',
                "z-10 absolute top-0  h-full w-full p-6 flex flex-wrap text-sm"
            )}>
                <div className="flex w-full items-left">
                    <div className=""><OverlayButton>{river.name}</OverlayButton></div>
                    <div className="ml-auto"><OverlayButton>Simulation Tools</OverlayButton></div>
                </div>

                <div className="flex mt-auto w-full items-left">
                    <div className=""><OverlayButton>info</OverlayButton></div>
                    <div className="ml-auto flex">
                        {/* <div className="text-white mr-2">{isRunning ? 'running' : 'paused'}</div>
                        <div className="text-white mr-2">{isRunning ? 'running' : 'paused'}</div> */}
                        <div className="ml-auto"><OverlayButton>{isRunning ? 'running' : 'paused'}</OverlayButton></div>
                        {/* <div className="text-white ml-2"></div> */}
                    </div>
                </div>
            </div>}
            {!isLoaded && <LoadingOverlay/>}
        </>
    )
}
 