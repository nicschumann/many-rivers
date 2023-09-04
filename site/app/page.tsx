// 'use client'

// import SimulationOverlay from '@/components/SimulationOverlay/SimulationOverlay'
// import SimulationRoot from '@/components/SimulationRoot/SimulationRoot'
// import { rivers } from '@/simulation/data/rivers'

// import { useRouter } from 'next/router'
// import { useEffect } from 'react'

// export default function Home() {
//   const { push } = useRouter()

//   const river_id = 'hidalgo';

//   useEffect(() => {

//   }, [])

//   return (
//     <main className="relative h-screen w-screen">
//         <SimulationRoot river={rivers[river_id]} />
//     </main>
//   )
// }

import { redirect } from 'next/navigation'
export default async function Home() {
  const river_id = 'el-horcon'

  redirect(`/rivers/${river_id}`)
}