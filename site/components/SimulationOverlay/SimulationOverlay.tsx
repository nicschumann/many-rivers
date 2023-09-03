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
                        <div className="ml-auto"><OverlayButton>{isRunning ? 'running' : 'paused'}</OverlayButton></div>
                        {/* <div className="text-white ml-2"></div> */}
                    </div>
                </div>
            </div>}
            {!isLoaded && <LoadingOverlay/>}
        </>
    )
}
 