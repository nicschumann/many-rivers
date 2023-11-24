import { classNames } from "@/utils";

export type RangeSpec = {
  name: string;
  options: { active: boolean; onClick: () => void }[];
};

type ControlRangeProps = { range: RangeSpec };

export default function ControlRange({ range }: ControlRangeProps) {
  return (
    <div className="flex items-left mr-10">
      <span className="mr-2 uppercase">{range.name}</span>

      {range.options.map((r, i) => {
        return (
          <span
            key={`erosion-${i}`}
            className="w-4 h-4 bg-transparent p-1 block rounded-lg mr-1 cursor-pointer"
          >
            <span
              className={classNames(
                r.active
                  ? "bg-white border-white"
                  : "bg-black hover:bg-white hover:bg-opacity-50 border-white",
                "w-3 h-3 border block rounded-lg"
              )}
            >
              &nbsp;
            </span>
          </span>
        );
      })}
    </div>
  );
}
