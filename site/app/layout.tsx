import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { description } from "@/components/ProjectDescription/ProjectDescription";

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
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
