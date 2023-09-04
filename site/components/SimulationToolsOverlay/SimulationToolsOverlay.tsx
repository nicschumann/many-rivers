'use client'

import { UIOverlayState, useApplicationState } from "@/store";
import OverlayButton from "../OverlayButton/OverlayButton";
import { classNames } from "@/utils";
import { useState } from "react";
import { River } from "@/simulation/data/rivers";

interface SimulationToolsOverlayProps {
    river: River
}

export default function SimulationToolsOverlay({ river }: SimulationToolsOverlayProps) {
    const [nextRiver, setNextRiver] = useState<River>(river)

    const setOverlayState = useApplicationState(s => {
        return (newOverlayState: UIOverlayState) => {
            s.setUIState({active_overlay: newOverlayState})
        }
    })


    return (
        <div className={classNames(
            "z-10 absolute top-0 bg-transparent h-full w-full p-6 flex flex-wrap text-white text-sm"
        )}>
            <div className="flex w-full items-left">
                <div onClick={() => setOverlayState(UIOverlayState.DroneView)} className="ml-auto">
                    <OverlayButton>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </OverlayButton>
                </div>
            </div>
            

            <div className="flex mt-auto w-full items-left">
                <div className="divide-y border w-96 border-white text-red-400 rounded-lg">
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
                            <div className="m-2">Slow</div>
                            <div className="m-2 border-b">Medium</div>
                            <div className="m-2">Fast</div>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="m-2">Accretion Threshold</div>
                        <div className="ml-auto flex">
                            <div className="m-2">Low</div>
                            <div className="m-2 border-b">Normal</div>
                            <div className="m-2">High</div>
                        </div>
                    </div>
                </div>

                <div className="divide-y border w-60 ml-2 border-white text-red-400 rounded-lg">
                    <div className="flex">
                        <div className="m-2">Hydrodynamics</div>
                        <div className="ml-auto flex">
                            <div className="m-2">Show</div>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="m-2">Sediment Dynamics</div>
                        <div className="ml-auto flex">
                            <div className="m-2">Show</div>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="m-2">Curvature</div>
                        <div className="ml-auto flex">
                            <div className="m-2">Show</div>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="m-2">Water Depth</div>
                        <div className="ml-auto flex">
                            <div className="m-2">Show</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
 