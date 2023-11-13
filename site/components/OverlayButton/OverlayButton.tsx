interface OverlayButtonProps {
  children: React.ReactNode;
}

export default function OverlayButton({ children }: OverlayButtonProps) {
  return (
    <button className="border uppercase rounded-3xl outline-none bg-transparent p-1 px-2 hover:bg-white hover:text-black">
      {children}
    </button>
  );
}
