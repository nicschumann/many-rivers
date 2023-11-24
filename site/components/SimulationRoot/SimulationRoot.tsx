"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import type { Regl } from "regl";

import parameters from "@/simulation/parameters";
import { compile_shaders } from "@/simulation/compile";
import { RenderContext } from "@/simulation/context";
import { InputAPI } from "@/simulation/inputs";
import { TARGET_FRAMETIME } from "@/simulation/constants";

import { UIOverlayState, useApplicationState } from "@/store";
import { River } from "@/simulation/data/rivers";

interface SimulationRootProps {
  river: River;
  setT: Dispatch<SetStateAction<number>>;
  setW: Dispatch<SetStateAction<number>>;
}

export default function SimulationRoot({
  river,
  setT,
  setW,
}: SimulationRootProps) {
  const baseCanvas = useRef<HTMLCanvasElement>(null);
  const [renderContext, setRenderContext] = useState<RenderContext | null>(
    null
  );

  const uiData = useApplicationState((state) => state.ui);
  const simData = useApplicationState((state) => state.sim);
  const setSimState = useApplicationState((state) => state.setSimState);
  const setSimParameters = useApplicationState(
    (state) => state.setSimParameters
  );
  const setUIState = useApplicationState((state) => state.setUIState);
  const setSimName = useApplicationState((state) => state.setSimName);

  /**
   * Initial canvas setup.
   */
  useEffect(() => {
    if (!baseCanvas.current) return;

    baseCanvas.current.width = window.innerWidth;
    baseCanvas.current.height = window.innerHeight;

    const regl: Regl = require("regl")({
      canvas: baseCanvas.current,
      attributes: { preserveDrawingBuffer: true },
      extensions: [
        "OES_texture_float",
        "OES_texture_float_linear",
        "OES_element_index_uint",
        "OES_standard_derivatives",
        "EXT_shader_texture_lod",
      ],
    });

    const shaders = compile_shaders(regl);

    // NOTE(Nic): Make RenderContext take sim parameters only.
    const localRenderContext = new RenderContext(
      river,
      regl,
      shaders,
      river.parameters
    );

    setRenderContext(localRenderContext);
    setSimParameters(river.parameters);
    setSimName(river.slug);
    setUIState(river.ui);

    // Resize Handler..

    // const resizeHandler = () => {
    //   if (baseCanvas.current == null) return;
    // };

    // window.addEventListener("resize", resizeHandler);

    // return () => {
    //   window.removeEventListener("resize", resizeHandler);
    // };
  }, [river, setSimParameters, setUIState, setSimName]);

  useEffect(() => {
    if (renderContext == null) return;

    // handle drag events.
    // internal state for the drag events...
    let shift_key_is_down = false;

    // game loop
    let t_minus_1 = performance.now();

    const input = new InputAPI(window);
    input.init();

    const renderLoopID = setInterval(() => {
      renderContext.handle_input(input);

      if (renderContext.simulation.loaded && !simData.state.loaded) {
        setSimState({ loaded: true });
      }

      if (uiData.active_overlay == UIOverlayState.SimulationView) {
        renderContext.views.slice(1).forEach((v) => {
          v.active = true;
        });
      } else {
        renderContext.views.slice(1).forEach((v) => {
          v.active = false;
        });
      }

      renderContext.regl.clear({ color: [0, 0, 0, 1] });
      renderContext.setup_transform();
      renderContext.render_tiles(simData, uiData);

      let t = performance.now();
      renderContext.resources.dt = (t - t_minus_1) / 1000;

      if (simData.state.running) {
        setT((s) => s + renderContext.resources.dt);
        setW(renderContext.resources.water_volume);
      }

      t_minus_1 = t;
    }, TARGET_FRAMETIME * 1000);

    const keydownHandler = (e: KeyboardEvent) => {
      if (e.key == "Shift") {
        shift_key_is_down = true;
      }

      if (e.key == " ") {
        parameters.running = !parameters.running;
        setSimState({ running: !simData.state.running });
      }

      if (e.key == "ArrowRight") {
        renderContext.regl.clear({ color: [0, 0, 0, 1] });
        let running = parameters.running;
        parameters.running = true;
        renderContext.setup_transform();
        renderContext.render_tiles(simData, uiData);
        parameters.running = running;
      }
    };

    const keyupHandler = (e: KeyboardEvent) => {
      if (e.key == "Shift") {
        shift_key_is_down = false;
      }
    };

    window.addEventListener("keydown", keydownHandler);
    window.addEventListener("keyup", keyupHandler);

    return () => {
      clearInterval(renderLoopID);
      window.removeEventListener("keydown", keydownHandler);
      window.removeEventListener("keyup", keyupHandler);
      input.deinit();
    };
  }, [renderContext, simData, uiData, setSimState, setW, setT]);

  return <canvas ref={baseCanvas} className="h-screen w-screen" />;
}
