import { colors } from "@/constants/theme";
import { storage, StorageKeys } from "@/helpers/storage";
import { Appearance } from "react-native";
import { create } from "zustand";

type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    isDarkMode: boolean;
    colors: typeof colors;
}

export const useThemeStore = create<ThemeState>((set, get) => {
    const savedMode = (storage.getString(StorageKeys.THEME_MODE) as ThemeMode) || "system";

    const getIsDarkMode = (mode: ThemeMode) => {
        if (mode === "system") {
            return Appearance.getColorScheme() === "dark";
        }
        return mode === "dark";
    };

    return {
        mode: savedMode,
        isDarkMode: getIsDarkMode(savedMode),
        colors: colors, // We will update this to handle dynamic colors later
        setMode: (mode: ThemeMode) => {
            storage.set(StorageKeys.THEME_MODE, mode);
            set({
                mode,
                isDarkMode: getIsDarkMode(mode),
            });
        },
    };
});

// Listener for system theme changes if mode is 'system'
Appearance.addChangeListener(({ colorScheme }) => {
    const currentMode = useThemeStore.getState().mode;
    if (currentMode === "system") {
        useThemeStore.setState({ isDarkMode: colorScheme === "dark" });
    }
});
