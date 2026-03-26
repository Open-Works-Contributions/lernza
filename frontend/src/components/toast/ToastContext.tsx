import React, { useState, useCallback } from "react";
import type { Toast } from "./ToastContext";
import { ToastContext } from "./ToastContext";

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback(
        ({ duration = 4000, ...toast }: Omit<Toast, "id">) => {
            const id = crypto.randomUUID();

            setToasts((prev) => [...prev, { ...toast, id, duration }]);

            if (duration !== Infinity) {
                setTimeout(() => removeToast(id), duration);
            }
        },
        [removeToast],
    );

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
};
