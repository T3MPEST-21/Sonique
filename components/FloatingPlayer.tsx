import { colors, fonts } from '@/constants/theme';
import { usePlayerStore } from '@/stores/playerStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const FloatingPlayer = () => {
    const { activeTrack, isPlaying, play, pause, resume } = usePlayerStore();
    const router = useRouter();

    if (!activeTrack) return null;

    const togglePlayback = async () => {
        if (isPlaying) {
            await pause();
        } else {
            await resume();
        }
    };

    const handlePress = () => {
        router.push('/player' as any);
    };

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={handlePress} style={styles.container}>
            <View style={styles.contentContainer}>
                <View style={styles.artworkPlaceholder}>
                    {/* TODO: Real artwork */}
                    <Ionicons name="musical-notes" size={20} color={colors.textMuted} />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title} numberOfLines={1}>{activeTrack.title}</Text>
                    <Text style={styles.artist} numberOfLines={1}>{activeTrack.artist}</Text>
                </View>

                <TouchableOpacity onPress={togglePlayback} hitSlop={10}>
                    <Ionicons
                        name={isPlaying ? "pause" : "play"}
                        size={24}
                        color={colors.text}
                    />
                </TouchableOpacity>
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
        backgroundColor: '#252525',
        borderRadius: 12,
        padding: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    artworkPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: colors.backgroundLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        marginRight: 12,
    },
    title: {
        color: colors.text,
        fontSize: fonts.xs,
        fontWeight: '600',
    },
    artist: {
        color: colors.textMuted,
        fontSize: fonts.xs,
    },
});
