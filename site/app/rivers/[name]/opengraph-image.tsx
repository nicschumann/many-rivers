import { ImageResponse } from "@vercel/og";
import { rivers } from "@/simulation/data/rivers";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "All Possible Rivers";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const formatAsLatLong = (t: [number, number]): string => {
  return `${t[0].toFixed(5)}, ${t[1].toFixed(5)}`;
};

// Image generation
export default async function Image({ params }: { params: { slug: string } }) {
  // Font

  const coordinates = formatAsLatLong(rivers[params.slug].coordinates);

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 128,
          color: "white",
          background: "black",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {coordinates}
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...size,
      fonts: [],
    }
  );
}
