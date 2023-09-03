'use client'

import { useApplicationState } from "@/store";
import OverlayButton from "../OverlayButton/OverlayButton";
import { classNames } from "@/utils";
import { useEffect, useState } from "react";
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";
import { rivers, River } from "@/simulation/data/rivers";
import Link from "next/link";

interface SimulationOverlayProps {
    river: River
}

export default function SimulationOverlay({ river }: SimulationOverlayProps) {
    const [ overlayVisible, setOverlayVisible ] = useState(true)
    const [nextRiver, setNextRiver] = useState<River>(river)

    const isLoaded = useApplicationState(s => s.sim.state.loaded)
    const isRunning = useApplicationState(s => s.sim.state.running)
    const setRunning = useApplicationState(s => {
        return (running: boolean) => {
            s.setSimState({running})
        }
    })

    useEffect(() => {
        const otherRivers = Object.values(rivers).filter(r => r.slug !== river.slug)
        const otherRiver = otherRivers[Math.floor(Math.random() * otherRivers.length)]

        setNextRiver(otherRiver)
    }, [river.slug])

    return (
        <>
            {isLoaded && <div className={classNames(
                isLoaded ? 'bg-transparent' : 'bg-black',
                "z-10 absolute top-0  h-full w-full p-6 flex flex-wrap text-white text-sm"
            )}>
                <div className="flex w-full items-left">
                    <div className="">
                        <OverlayButton>
                            <Link href={`/rivers/${nextRiver.slug}`}>&rarr; &ldquo;{nextRiver.name}&rdquo;</Link>
                        </OverlayButton>
                    </div>
                    <div className="ml-auto text-red-500"><OverlayButton>simulation tools</OverlayButton></div>
                </div>

                <div className="flex mt-auto w-full items-left">
                    <div className="text-red-500"><OverlayButton>info</OverlayButton></div>
                    <div className="ml-auto flex">
                        {/* <div className="text-white mr-2">{isRunning ? 'running' : 'paused'}</div>
                        <div className="text-white mr-2">{isRunning ? 'running' : 'paused'}</div> */}
                        <div onClick={() => setRunning(!isRunning)} className="ml-auto">
                            <OverlayButton>{
                                isRunning 
                                    ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>
                                    : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>
                                }
                            </OverlayButton>
                        </div>
                        {/* <div className="text-white ml-2"></div> */}
                    </div>
                </div>
            </div>}
            {!isLoaded && <LoadingOverlay/>}
        </>
    )
}
 