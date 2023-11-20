interface ModalOverlayProps {
  children?: React.ReactNode;
  closeModal: () => void;
}

export default function ModalOverlay({
  children,
  closeModal,
}: ModalOverlayProps) {
  return (
    <div className="absolute z-10 top-0 left-0 w-screen h-screen backdrop-blur-sm">
      <div className="border-white border text-white mx-8 mt-8 p-8 h-full rounded-md">
        <div className="text-right">
          <div onClick={closeModal}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 ml-auto text-white hover:text-black cursor-pointer hover:bg-white rounded-xl"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
