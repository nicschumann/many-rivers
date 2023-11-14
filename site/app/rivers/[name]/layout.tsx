import "../../globals.css";
import { Inter } from "next/font/google";
import { rivers } from "@/simulation/data/rivers";

const inter = Inter({ subsets: ["latin"] });

export function generateMetadata({ params }: { params: { name: string } }) {
  return {
    title: rivers[params.name].name,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
