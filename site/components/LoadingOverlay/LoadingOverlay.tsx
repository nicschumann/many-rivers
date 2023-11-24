"use client";

import { classNames } from "@/utils";

export default function LoadingOverlay() {
  return (
    <div
      className={classNames(
        "z-10 absolute top-0 bg-black h-full w-full p-6 flex flex-wrap text-sm items-center justify-center"
      )}
    >
      <div className="w-full text-white text-center uppercase">
        <div className="">loading ...</div>
      </div>
    </div>
  );
}
