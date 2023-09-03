import SimulationOverlay from '@/components/SimulationOverlay/SimulationOverlay'
import SimulationRoot from '@/components/SimulationRoot/SimulationRoot'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="relative h-screen w-screen">
        <SimulationRoot />
        <SimulationOverlay />
    </main>
  )
}
