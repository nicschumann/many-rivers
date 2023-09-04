'use client'

import { UIOverlayState, useApplicationState } from "@/store";
import OverlayButton from "../OverlayButton/OverlayButton";
import { classNames } from "@/utils";
import { useState } from "react";
import { River } from "@/simulation/data/rivers";

interface SimulationToolsDisplayModesProps {
}

export default function SimulationToolsDisplayModes() {

    const displayStates = useApplicationState(s => {
        return [
            {
                name: 'Hydrodynamics',
                enabled: true,
                value: s.ui.render_flux,
                update: (render_flux: boolean) => { s.setUIState({render_flux}) }
            },
            {
                name: 'Sediment Dynamics',
                enabled: true,
                value: s.ui.render_erosion_accretion,
                update: (render_erosion_accretion: boolean) => { s.setUIState({render_erosion_accretion}) }
            },
            {
                name: 'Curvature',
                enabled: true,
                value: s.ui.render_curvature,
                update: (render_curvature: boolean) => { s.setUIState({render_curvature}) }
            },
            {
                name: 'Water Depth',
                enabled: true,
                value: s.ui.render_depth,
                update: (render_depth: boolean) => { s.setUIState({render_depth}) }
            },
        ]
    })


    return (
        <div className="divide-y border w-60 ml-2 border-white rounded-lg">
            {displayStates.map((state, i) => {
                return (
                    <div key={`display-state-${i}`} className={classNames(
                        state.enabled ? '' : 'text-red-400',
                        'flex'
                    )}>
                        <div className="m-2">{state.name}</div>
                        <div className="ml-auto flex">
                            <div 
                                onClick={() => state.update(!state.value)} 
                                className={classNames(
                                    "m-2 border-b cursor-pointer border-transparent hover:border-white"
                                )}>
                                {state.value ? 'Hide' : 'Show'}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
 