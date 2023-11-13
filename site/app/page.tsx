import { redirect } from "next/navigation";
import { rivers } from "@/simulation/data/rivers";

export default async function Home() {
  const ids = Object.keys(rivers);
  const river_id = ids[Math.floor(Math.random() * ids.length)];

  redirect(`/rivers/${river_id}`);
}
