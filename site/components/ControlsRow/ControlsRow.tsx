import { classNames } from "@/utils";
import ControlRange from "./ControlRange";
import ControlToggle from "./ControlToggle";

type ControlRowProps = {
  className: string;
};

export default function ControlsRow({ className }: ControlRowProps) {
  return (
    <div className={classNames(className, "flex mx-auto uppercase pt-1")}>
      <ControlRange
        range={{
          name: "Erosion",
          options: [
            { active: false, onClick: () => {} },
            { active: false, onClick: () => {} },
            { active: true, onClick: () => {} },
          ],
        }}
      />

      <ControlRange
        range={{
          name: "Accretion",
          options: [
            { active: false, onClick: () => {} },
            { active: false, onClick: () => {} },
            { active: true, onClick: () => {} },
          ],
        }}
      />
      <ControlRange
        range={{
          name: "Water",
          options: [
            { active: false, onClick: () => {} },
            { active: false, onClick: () => {} },
            { active: true, onClick: () => {} },
          ],
        }}
      />
      <ControlToggle name="dry" active={false} onClick={() => {}} />
      <ControlToggle name="wet" active={false} onClick={() => {}} />
    </div>
  );
}
