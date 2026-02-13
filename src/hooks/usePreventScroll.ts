import { useEffect } from "react";

/**
 * Prevents page scrolling when a modal/dialog is open.
 */
export function usePreventScroll({ isDisabled }: { isDisabled: boolean }) {
    useEffect(() => {
        if (isDisabled) return;

        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = original;
        };
    }, [isDisabled]);
}
