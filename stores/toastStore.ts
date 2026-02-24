import { create } from 'zustand';

export type ToastType = 'info' | 'success' | 'error';

interface ToastState {
    message: string | null;
    type: ToastType;
    visible: boolean;
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
    message: null,
    type: 'info',
    visible: false,
    showToast: (message, type = 'info', duration = 3000) => {
        set({ message, type, visible: true });
        setTimeout(() => {
            set({ visible: false });
        }, duration);
    },
    hideToast: () => set({ visible: false }),
}));
