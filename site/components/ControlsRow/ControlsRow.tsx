"use client";

import { classNames } from "@/utils";
import ControlRange from "./ControlRange";
import ControlToggle from "./ControlToggle";
import { useApplicationState } from "@/store";
import { rivers } from "@/simulation/data/rivers";

type ControlRowProps = {
  className: string;
};

const DEVIATION = 0.1;

export default function ControlsRow({ className }: ControlRowProps) {
  const riverName = useApplicationState((s) => s.sim.name);
  const initialParameters = {
    erosion: rivers[riverName].parameters.erosion_speed,
    accretion: rivers[riverName].parameters.accretion_speed,
    water: rivers[riverName].parameters.initial_water,
  };
  const currentParameters = useApplicationState((s) => {
    return {
      erosion: s.sim.parameters.erosion_speed,
      accretion: s.sim.parameters.accretion_speed,
      water: s.sim.parameters.initial_water,
    };
  });

  const currentUI = useApplicationState((s) => {
    return {
      dry: s.ui.render_dry,
      wet: s.ui.render_wet,
    };
  });

  const setSimParameters = useApplicationState((s) => {
    return s.setSimParameters;
  });

  const setUIState = useApplicationState((s) => {
    return s.setUIState;
  });

  const isMinValue = (key: keyof typeof initialParameters): boolean => {
    return currentParameters[key] < initialParameters[key] - DEVIATION;
  };

  const isMedValue = (key: keyof typeof initialParameters): boolean => {
    return (
      currentParameters[key] >= initialParameters[key] - DEVIATION &&
      currentParameters[key] < initialParameters[key] + DEVIATION
    );
  };

  const isMaxValue = (key: keyof typeof initialParameters): boolean => {
    return currentParameters[key] >= initialParameters[key] + DEVIATION;
  };

  return (
    <div className={classNames(className, "flex mx-auto uppercase pt-1")}>
      <ControlRange
        range={{
          name: "Erosion",
          options: [
            {
              active: isMinValue("erosion"),
              onClick: () => {
                setSimParameters({
                  erosion_speed: initialParameters.erosion - 2.0 * DEVIATION,
                });
              },
            },
            {
              active: isMedValue("erosion"),
              onClick: () => {
                setSimParameters({
                  erosion_speed: initialParameters.erosion,
                });
              },
            },
            {
              active: isMaxValue("erosion"),
              onClick: () => {
                setSimParameters({
                  erosion_speed: initialParameters.erosion + 2.0 * DEVIATION,
                });
              },
            },
          ],
        }}
      />

      <ControlRange
        range={{
          name: "Accretion",
          options: [
            {
              active: isMinValue("accretion"),
              onClick: () => {
                setSimParameters({
                  accretion_speed:
                    initialParameters.accretion - 2.0 * DEVIATION,
                });
              },
            },
            {
              active: isMedValue("accretion"),
              onClick: () => {
                setSimParameters({
                  accretion_speed: initialParameters.accretion,
                });
              },
            },
            {
              active: isMaxValue("accretion"),
              onClick: () => {
                setSimParameters({
                  accretion_speed:
                    initialParameters.accretion + 2.0 * DEVIATION,
                });
              },
            },
          ],
        }}
      />
      {/* <ControlRange
        range={{
          name: "Water",
          options: [
            {
              active: isMinValue("water"),
              onClick: () => {},
            },
            {
              active: isMedValue("water"),
              onClick: () => {},
            },
            {
              active: isMaxValue("water"),
              onClick: () => {},
            },
          ],
        }}
      /> */}
      <ControlToggle
        name="wet cells"
        active={currentUI.wet}
        onClick={() => {
          setUIState({ render_wet: !currentUI.wet });
        }}
      />
      <ControlToggle
        name="dry cells"
        active={currentUI.dry}
        onClick={() => {
          setUIState({ render_dry: !currentUI.dry });
        }}
      />
    </div>
  );
}
