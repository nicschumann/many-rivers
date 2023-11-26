import "./globals.css";
import { Inter } from "next/font/google";

import { description } from "@/components/ProjectDescription/ProjectDescription";

const inter = Inter({ subsets: ["latin"] });

export function generateMetadata({ params }: { params: { name: string } }) {
  return {
    title: "All Possible Rivers",
    description,
    openGraph: {
      title: "All Possible Rivers",
      description,
    },
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
