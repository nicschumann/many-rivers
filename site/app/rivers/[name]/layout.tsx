import { rivers } from "@/simulation/data/rivers";
import { description } from "@/components/ProjectDescription/ProjectDescription";

export function generateMetadata({ params }: { params: { name: string } }) {
  return {
    title: rivers[params.name].coordinates.map((x) => x.toFixed(5)).join(", "),
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
