import { useColorScheme } from 'react-native';
import { FontSizeScale, useThemeStore } from '../stores/themeStore';

const BASE_COLORS = {
    primary: '#fc3c44', // Default Apollo Red
    white: '#ffffff',
    black: '#000000',
    gray: '#9ca3af',
    danger: '#e74c3c',
};

export const lightPalette = {
    background: '#f8f9fa',
    backgroundLight: '#ffffff',
    text: '#1a1a1a',
    textMuted: '#666666',
    border: '#e1e4e8',
    card: '#ffffff',
    tabBar: '#ffffff',
};

export const darkPalette = {
    background: '#000000',
    backgroundLight: '#1a1a1a',
    text: '#ffffff',
    textMuted: '#9ca3af',
    border: '#2d2e2e',
    card: '#121212',
    tabBar: '#121212',
};

const FONT_SCALES: Record<FontSizeScale, number> = {
    small: 0.85,
    medium: 1.0,
    large: 1.2,
};

export const fonts = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
};

export const screenPadding = {
    horizontal: 24,
    vertical: 20,
};

/**
 * Universal hook to access the current theme configuration.
 * Reacts to store changes AND system appearance changes.
 */
export const useTheme = () => {
    const {
        mode,
        accentColor,
        fontSizeScale,
        cornerRadius,
        backgroundStyle,
        glassIntensity,
        hapticLevel
    } = useThemeStore();

    const systemColorScheme = useColorScheme();
    const isDark = mode === 'system' ? systemColorScheme === 'dark' : mode === 'dark';

    const palette = isDark ? darkPalette : lightPalette;
    const scale = FONT_SCALES[fontSizeScale];

    return {
        colors: {
            ...palette,
            primary: accentColor,
            danger: BASE_COLORS.danger,
            white: BASE_COLORS.white,
            black: BASE_COLORS.black,
        },
        fonts: {
            xs: fonts.xs * scale,
            sm: fonts.sm * scale,
            md: fonts.md * scale,
            lg: fonts.lg * scale,
        },
        spacing: screenPadding,
        cornerRadius,
        backgroundStyle,
        glassIntensity,
        hapticLevel,
        isDark,
    };
};

// Legacy export for quick fixes, though components should migrate to useTheme()
export const colors = darkPalette; 