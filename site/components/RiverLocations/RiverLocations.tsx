import { rivers } from "@/simulation/data/rivers";
import { classNames } from "@/utils";
import Link from "next/link";

export default function RiverLocations({
  currentSlug,
}: {
  currentSlug: string;
}) {
  const riverArray = Object.values(rivers).sort((a, b) => {
    return b.coordinates[0] - a.coordinates[0];
  });

  const minLat = riverArray[0].coordinates[0];
  const maxLat = riverArray[riverArray.length - 1].coordinates[0];
  const range = maxLat - minLat;

  const even = true;
  const lineColor = "border-gray-700";

  return (
    <div className={classNames("relative w-full mx-8 h-8")}>
      <div
        className={`absolute w-full h-[50.5%] border-b ${lineColor}`}
        // style={{left:'0%', top: '50%'}}
      ></div>
      {riverArray.map((river, i) => {
        const lat = river.coordinates[0];
        const left = even
          ? `${(
              (i / riverArray.length + 1 / (2 * riverArray.length)) *
              100
            ).toFixed(3)}%`
          : `${(((lat - minLat) / range) * 100).toFixed(3)}%`;
        const active = river.slug == currentSlug;
        return (
          <Link
            href={`/rivers/${river.slug}`}
            key={`river-id-${river.slug}`}
            style={{
              left,
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
            className={"absolute"}
          >
            <span className="w-4 h-4 bg-black p-1 block rounded-lg">
              <span
                className={classNames(
                  active
                    ? "bg-white border-white"
                    : "bg-black hover:bg-white border-white",
                  "w-2 h-2  border  block rounded-lg"
                )}
              >
                &nbsp;
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
