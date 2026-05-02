import { River } from "@/simulation/data/rivers";
import { TILE_SIZE } from "@/simulation/constants";
import { UIOverlayVisibility, useApplicationState } from "@/store";
import { classNames } from "@/utils";
import { useEffect, useState } from "react";

interface HeaderRowProps {
  t: number;
  w: number;
  river: River;
}

const formatAsLatLong = (t: [number, number]): string => {
  return `${t[0].toFixed(5)}, ${t[1].toFixed(5)}`;
};

const formatAsCycles = (t: number): string => {
  return `${t.toFixed(0)} ciclos`;
};

const formatAsVolume = (w: number): string => {
  const d = TILE_SIZE.reduce((a, b) => a * b, 1) - w;

  return `${Math.round(w).toLocaleString("es-MX")} H / ${d.toLocaleString(
    "es-MX"
  )} S`;
};

const MIN_FONT_REM = 1;
const FONT_STEP_REM = 0.1;

export default function HeaderRow({ t, w, river }: HeaderRowProps) {
  const overlayVisibility = useApplicationState((s) => s.ui.overlay_visibility);
  const shouldHide = overlayVisibility !== UIOverlayVisibility.Freelook;
  const [fontRem, setFontRem] = useState(MIN_FONT_REM);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "+" || e.key === "=") {
        setFontRem((r) => r + FONT_STEP_REM);
      } else if (e.key === "-" || e.key === "_") {
        setFontRem((r) => Math.max(MIN_FONT_REM, r - FONT_STEP_REM));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div
      style={{ fontSize: `${fontRem}rem` }}
      className={classNames(
        shouldHide ? "hidden" : "",
        "flex w-full justify-between uppercase py-1"
      )}
    >
      <div>{formatAsLatLong(river.coordinates)}</div>
      <div>{formatAsCycles(t)}</div>
      <div>{formatAsVolume(w)}</div>
    </div>
  );
}
