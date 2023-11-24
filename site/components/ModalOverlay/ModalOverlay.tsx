import { useEffect } from "react";
import OverlayButton from "../OverlayButton/OverlayButton";

interface ModalOverlayProps {
  children?: React.ReactNode;
  closeModal: () => void;
}

export default function ModalOverlay({
  children,
  closeModal,
}: ModalOverlayProps) {
  useEffect(() => {
    const keydownListener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", keydownListener);

    return () => window.removeEventListener("keydown", keydownListener);
  }, [closeModal]);

  return (
    <div className="absolute z-10 top-0 left-0 w-screen h-screen my-auto overflow-scroll">
      <div className="border-white border text-white m-8 xl:mx-72 lg:mx-32 pt-8 pb-16 px-20 rounded-md overflow-scroll">
        <div className="text-right">
          <div onClick={closeModal}>
            <OverlayButton>
              <span className="px-[0.2rem]">X</span>
            </OverlayButton>
          </div>
        </div>
        <div className="h-full overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
