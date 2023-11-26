import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { description } from "@/components/ProjectDescription/ProjectDescription";

export function generateMetadata() {
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
    <html lang="en" className="bg-black w-screen h-screen">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
