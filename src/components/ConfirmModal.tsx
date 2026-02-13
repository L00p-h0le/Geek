interface ConfirmModalProps {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "default";
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "default",
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center animate-backdrop-in"
            onClick={onCancel}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative animate-fade-in-up bg-secondary border border-primary/50 rounded-sm px-8 py-6 max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Top accent line */}
                <div
                    className={`absolute top-0 left-0 right-0 h-px ${variant === "danger" ? "bg-red-500/60" : "bg-accent/40"
                        }`}
                />

                <h3 className="text-text font-semibold text-lg mb-2 tracking-tight">
                    {title}
                </h3>

                <p className="text-accent/70 text-sm font-mono leading-relaxed mb-6">
                    {message}
                </p>

                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm text-accent/60 hover:text-text border border-primary/40 hover:border-accent/40 rounded-sm transition-all duration-200 cursor-pointer"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm rounded-sm transition-all duration-200 cursor-pointer ${variant === "danger"
                                ? "text-red-400 border border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50"
                                : "text-bg bg-accent hover:bg-text font-medium"
                            }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
