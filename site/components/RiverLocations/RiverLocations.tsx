import { riverOrder, rivers } from "@/simulation/data/rivers";
import { classNames } from "@/utils";
import Link from "next/link";

export default function RiverLocations({
  currentSlug,
}: {
  currentSlug: string;
}) {
  const riverArray = riverOrder.map((id) => rivers[id]);

  const minLat = riverArray[0].coordinates[0];
  const maxLat = riverArray[riverArray.length - 1].coordinates[0];
  const range = maxLat - minLat;

  const even = true;

  return (
    <div className={classNames("relative w-full mx-24 h-8")}>
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
            <span className="w-5 h-5 bg-transparent p-1 block rounded-lg">
              <span
                className={classNames(
                  active
                    ? "bg-white border-white"
                    : "bg-transparent hover:bg-white hover:bg-opacity-50 border-white",
                  "w-3 h-3  border  block rounded-lg"
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
