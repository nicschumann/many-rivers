
interface OverlayButtonProps {
    children: React.ReactNode
}

export default function OverlayButton({ children }: OverlayButtonProps) {
    return (
        <button className="border lowercase rounded-3xl bg-transparent p-2">
            {children}
        </button>
    )
}