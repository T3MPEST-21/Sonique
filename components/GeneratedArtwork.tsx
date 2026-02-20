import { colors } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface Props {
    name: string;         // playlist name — first char is used as the letter
    size?: number;        // width/height of the square, default 60
    style?: ViewStyle;
}

// Gradient colour pairs keyed by initial letter (A–Z + fallback)
const PALETTE: [string, string][] = [
    ['#7F00FF', '#E100FF'],
    ['#1A2980', '#26D0CE'],
    ['#ee0979', '#ff6a00'],
    ['#f7971e', '#ffd200'],
    ['#56ab2f', '#a8e063'],
    ['#373B44', '#4286f4'],
    ['#c31432', '#240b36'],
    ['#0f0c29', '#302b63'],
];

function paletteFor(name: string): [string, string] {
    const code = name.charCodeAt(0) || 0;
    return PALETTE[code % PALETTE.length];
}

/**
 * A pure-RN generated artwork tile — used as the fallback when
 * a playlist has no user-picked artwork and no song artwork is available.
 * Simulates a gradient by layering two coloured Views with opacity.
 */
export const GeneratedArtwork: React.FC<Props> = ({ name, size = 60, style }) => {
    const [colorA, colorB] = paletteFor(name);
    const initial = name.trim().charAt(0).toUpperCase() || '♪';
    const fontSize = size * 0.38;
    const noteSize = size * 0.18;

    return (
        <View style={[styles.root, { width: size, height: size, borderRadius: size * 0.12, backgroundColor: colorA }, style]}>
            {/* Simulated gradient overlay */}
            <View style={[styles.overlay, { backgroundColor: colorB }]} />

            {/* Music note (top-left) */}
            <Text style={[styles.note, { fontSize: noteSize, lineHeight: noteSize * 1.2 }]}>♪</Text>

            {/* Big initial letter (centred) */}
            <Text style={[styles.initial, { fontSize, lineHeight: fontSize * 1.1 }]} numberOfLines={1}>
                {initial}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.45,
    },
    note: {
        position: 'absolute',
        top: '10%',
        left: '12%',
        color: 'rgba(255,255,255,0.55)',
        fontWeight: 'bold',
    },
    initial: {
        color: colors.text,
        fontWeight: '800',
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
});
