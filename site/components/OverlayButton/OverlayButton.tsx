
interface OverlayButtonProps {
    children: React.ReactNode
}

export default function OverlayButton({ children }: OverlayButtonProps) {
    return (
        <button className="border lowercase w-40 rounded-3xl bg-transparent p-2">
            {children}
        </button>
    )
}