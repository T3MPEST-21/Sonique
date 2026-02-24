import { useTheme } from '@/constants/theme';
import { usePlayerStore } from '@/stores/playerStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useActiveTrack, useProgress } from 'react-native-track-player';

export const FloatingPlayer = () => {
    const { isPlaying, pause, resume, stop } = usePlayerStore();
    const activeTrack = useActiveTrack();
    const { colors, fonts, cornerRadius, backgroundStyle, glassIntensity } = useTheme();
    const { position, duration } = useProgress();
    const router = useRouter();

    if (!activeTrack) return null;

    const progress = duration > 0 ? (position / duration) * 100 : 0;

    const togglePlayback = async () => {
        if (isPlaying) {
            await pause();
        } else {
            await resume();
        }
    };

    const handleStop = async (e: any) => {
        e.stopPropagation(); // Don't navigate to player
        await stop();
    };

    const handlePress = () => {
        router.push('/player' as any);
    };

    const isGlass = backgroundStyle === 'glass';

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={handlePress}
            style={[
                styles.container,
                {
                    backgroundColor: isGlass ? colors.backgroundLight + Math.floor(glassIntensity * 255).toString(16).padStart(2, '0') : colors.backgroundLight,
                    borderRadius: cornerRadius,
                    borderColor: isGlass ? colors.white + '10' : colors.border,
                }
            ]}
        >
            <View style={styles.contentContainer}>
                <View style={[styles.artworkPlaceholder, { borderRadius: cornerRadius * 0.7, backgroundColor: colors.background }]}>
                    <Ionicons name="musical-notes" size={20} color={colors.textMuted} />
                </View>

                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: colors.text, fontSize: fonts.xs }]} numberOfLines={1}>{activeTrack.title}</Text>
                    <Text style={[styles.artist, { color: colors.textMuted, fontSize: fonts.xs }]} numberOfLines={1}>{activeTrack.artist}</Text>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity onPress={togglePlayback} hitSlop={10} style={styles.controlBtn}>
                        <Ionicons
                            name={isPlaying ? "pause" : "play"}
                            size={24}
                            color={isPlaying ? colors.primary : colors.text}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleStop} hitSlop={10} style={styles.controlBtn}>
                        <Ionicons
                            name="close"
                            size={24}
                            color={colors.textMuted}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Non-touchable Progress Bar */}
            <View style={[styles.progressBackground, { backgroundColor: isGlass ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderBottomLeftRadius: cornerRadius, borderBottomRightRadius: cornerRadius }]}>
                <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary }]} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 78, // Above tab bar
        left: 8,
        right: 8,
        padding: 8,
        borderWidth: 1,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    artworkPlaceholder: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        marginRight: 8,
    },
    title: {
        fontWeight: '600',
    },
    artist: {
        marginTop: 2,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    controlBtn: {
        padding: 4,
    },
    progressBackground: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
    }
});
