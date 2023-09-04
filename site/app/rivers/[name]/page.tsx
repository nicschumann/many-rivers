import SimulationOverlay from '@/components/SimulationOverlay/SimulationOverlay'
import SimulationRoot from '@/components/SimulationRoot/SimulationRoot'
import { rivers } from '@/simulation/data/rivers'

export default function River({ params }: {params: {name: string}}) {

    const river_id = params.name

    if (typeof rivers[river_id] == 'undefined') {
        return (
            <main className="relative h-screen w-screen">
                <SimulationOverlay river={rivers[river_id]} />
            </main>
        )
    }

    return (
        <main className="relative h-screen w-screen">
            <SimulationRoot river={rivers[river_id]} />
            <SimulationOverlay river={rivers[river_id]} />
        </main>
    )
}
