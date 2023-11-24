import ControlRange from "./ControlRange";

type ControlToggleProps = {
  name: string;
  active: boolean;
  onClick: () => void;
};

export default function ControlToggle({
  name,
  active,
  onClick,
}: ControlToggleProps) {
  return (
    <ControlRange
      range={{
        name,
        options: [
          {
            active,
            onClick,
          },
        ],
      }}
    />
  );
}
