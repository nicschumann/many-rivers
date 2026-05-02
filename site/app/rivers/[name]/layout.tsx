import { rivers } from "@/simulation/data/rivers";
import { description } from "@/components/ProjectDescription/ProjectDescription";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  return {
    title: rivers[name].coordinates.map((x) => x.toFixed(5)).join(", "),
    description,
    openGraph: {
      title: "All Possible Rivers",
      description,
    },
  };
}

export default function RiversLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
