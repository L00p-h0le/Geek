import { useEffect, useState } from "react";

interface ToastProps {
    message: string;
    type?: "success" | "error" | "info";
    duration?: number;
    onClose: () => void;
}

const TYPE_STYLES: Record<string, string> = {
    success: "border-accent/40",
    error: "border-red-500/40",
    info: "border-primary",
};

const TYPE_ICONS: Record<string, string> = {
    success: "✓",
    error: "✕",
    info: "i",
};

export function Toast({ message, type = "info", duration = 2500, onClose }: ToastProps) {
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLeaving(true);
            setTimeout(onClose, 200);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className="fixed top-6 right-6 z-50 animate-slide-down">
            <div
                className={`
          flex items-center gap-3 px-5 py-3
          bg-secondary/95 backdrop-blur-sm border ${TYPE_STYLES[type]}
          rounded-sm font-mono text-sm text-text
          transition-all duration-200
          ${isLeaving ? "opacity-0 translate-y-[-8px]" : "opacity-100"}
        `}
            >
                <span className="text-accent text-xs font-bold w-5 h-5 flex items-center justify-center border border-accent/30 rounded-full">
                    {TYPE_ICONS[type]}
                </span>
                <span>{message}</span>
            </div>
        </div>
    );
}
