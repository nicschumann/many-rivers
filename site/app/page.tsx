import SimulationOverlay from '@/components/SimulationOverlay/SimulationOverlay'
import SimulationRoot from '@/components/SimulationRoot/SimulationRoot'
import { rivers } from '@/simulation/data/rivers'

export default function Home() {

  const river_id = 'hidalgo';

  return (
    <main className="relative h-screen w-screen">
        <SimulationRoot river={rivers[river_id]} />
        <SimulationOverlay river={rivers[river_id]} />
    </main>
  )
}
