'use client'

import { UIOverlayState, useApplicationState } from "@/store";
import OverlayButton from "../OverlayButton/OverlayButton";
import { classNames } from "@/utils";
import { useState } from "react";
import { River } from "@/simulation/data/rivers";
import Link from "next/link";

interface DroneViewOverlayProps {
    river: River
    nextRiver: River
}

export default function DroneViewOverlay({ river, nextRiver }: DroneViewOverlayProps) {
    const [ overlayVisible, setOverlayVisible ] = useState(true)

    const isRunning = useApplicationState(s => s.sim.state.running)
    const setRunning = useApplicationState(s => {
        return (running: boolean) => {
            s.setSimState({running})
        }
    })

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
                <div className="">
                    <OverlayButton>
                        <Link href={`/rivers/${nextRiver.slug}`}>New River</Link>
                    </OverlayButton>
                </div>
                <div onClick={() => setOverlayState(UIOverlayState.SimTools)} className="ml-auto">
                    <OverlayButton>Simulation Tools</OverlayButton>
                </div>
            </div>

            <div className="flex mt-auto w-full items-left">
                <div className="text-red-500"><OverlayButton>Info</OverlayButton></div>
                <div className="ml-auto flex">
                    <div className="text-white mr-10 py-2.5">metadata 1</div>
                    <div className="text-white mr-10 py-2.5">metadata 2</div>
                    <div onClick={() => setRunning(!isRunning)} className="ml-auto">
                        <OverlayButton>{
                            isRunning 
                                ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>
                                : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>
                            }
                        </OverlayButton>
                    </div>
                    {/* <div className="text-white ml-2">Test</div> */}
                </div>
            </div>
        </div>
    )
}
 