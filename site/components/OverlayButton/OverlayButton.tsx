
interface OverlayButtonProps {
    children: React.ReactNode
}

export default function OverlayButton({ children }: OverlayButtonProps) {
    return (
        <button className="border lowercase border-white w-40 rounded-3xl bg-transparent p-2 text-white">
            {children}
        </button>
    )
}