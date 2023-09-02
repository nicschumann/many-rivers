'use client'

import { useEffect, useRef } from "react"

export default function SimulationRoot() {
    const baseCanvas = useRef(null)

    /**
     * Initial canvas setup.
     */
    useEffect(() => {
        if (!baseCanvas.current) return;

        const regl = require('regl')(baseCanvas.current)
    })



    return (
        <canvas ref={baseCanvas} className="h-screen w-screen border" />
    )
}