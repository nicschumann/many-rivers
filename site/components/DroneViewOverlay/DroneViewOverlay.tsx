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
                    <OverlayButton>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </OverlayButton>
                </div>
            </div>

            <div className="flex mt-auto w-full items-left">
                <div className="text-[#ff0000]">
                    <OverlayButton>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                        </svg>
                    </OverlayButton>
                </div>
                <div className="ml-auto flex">
                    <div className="text-[#ff0000] mr-10 py-2.5">metadata 1</div>
                    <div className="text-[#ff0000] mr-10 py-2.5">metadata 2</div>
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
 