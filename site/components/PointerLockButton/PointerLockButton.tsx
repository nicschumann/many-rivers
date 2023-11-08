import OverlayButton from "../OverlayButton/OverlayButton";

interface PointerLockButton {
  className: string;
}

export default function PointerLockButton({ className }: PointerLockButton) {
  return (
    <div
      onClick={() => {
        let c = document.querySelectorAll("canvas");
        if (c.length == 1) {
          c[0].requestPointerLock();
        }
      }}
      className={className}
    >
      <OverlayButton>
        <span>Camera</span>
      </OverlayButton>
    </div>
  );
}
