import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { storage } from '../utils/storage';

export type ThemeMode = 'light' | 'dark' | 'system';
export type BackgroundStyle = 'solid' | 'glass' | 'mesh';
export type HapticLevel = 'none' | 'light' | 'medium' | 'heavy';
export type FontSizeScale = 'small' | 'standard' | 'large';

interface ThemeState {
    mode: ThemeMode;
    accentColor: string;
    backgroundStyle: BackgroundStyle;
    fontSizeScale: FontSizeScale;
    cornerRadius: number;
    glassIntensity: number;
    hapticLevel: HapticLevel;

    // Actions
    updateTheme: (updates: Partial<Omit<ThemeState, 'updateTheme' | 'resetToDefaults'>>) => void;
    resetToDefaults: () => void;
}

const DEFAULT_THEME: Omit<ThemeState, 'updateTheme' | 'resetToDefaults'> = {
    mode: 'dark',
    accentColor: '#fc3c44', // Apollo Red
    backgroundStyle: 'solid',
    fontSizeScale: 'standard',
    cornerRadius: 12,
    glassIntensity: 0.5,
    hapticLevel: 'medium',
};

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            ...DEFAULT_THEME,

            updateTheme: (updates) => set((state) => ({ ...state, ...updates })),

            resetToDefaults: () => set({ ...DEFAULT_THEME }),
        }),
        {
            name: 'user-theme-config',
            storage: createJSONStorage(() => ({
                setItem: (name, value) => storage.set(name, value),
                getItem: (name) => storage.getString(name) ?? null,
                removeItem: (name) => (storage as any).delete(name),
            })),
        }
    )
);
