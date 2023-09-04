'use client'

import { useApplicationState } from "@/store";
import OverlayButton from "../OverlayButton/OverlayButton";
import { classNames } from "@/utils";
import { useEffect, useState } from "react";
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";
import { rivers, River } from "@/simulation/data/rivers";
import Link from "next/link";
import DroneViewOverlay from "../DroneViewOverlay/DroneViewOverlay";

interface SimulationOverlayProps {
    river: River
}

export default function SimulationOverlay({ river }: SimulationOverlayProps) {
    const [ overlayVisible, setOverlayVisible ] = useState(true)
    const [nextRiver, setNextRiver] = useState<River>(river)

    const isLoaded = useApplicationState(s => s.sim.state.loaded)

    return (
        <>
            {isLoaded && <DroneViewOverlay river={river} />}
            {!isLoaded && <LoadingOverlay/>}
        </>
    )
}
 