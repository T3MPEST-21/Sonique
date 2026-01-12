import { COLORS } from '@/constants/theme';
import { useAudio } from '@/contexts/AudioContext';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const GlobalMiniPlayer = () => {
    const router = useRouter();
    const pathname = usePathname();
    const {
        currentTrack,
        isPlaying,
        pauseTrack,
        resumeTrack,
        playNext,
        playPrev,
        stopPlayback,
        position,
        duration
    } = useAudio();

    // Check if we are in tabs to adjust bottom position
    const isInTabs = pathname.includes('(tabs)');
    const isInPlayer = pathname.includes('PlayerModal');

    // Don't show if no track or if we are already in the full player modal
    if (!currentTrack || isInPlayer) return null;

    const progress = duration > 0 ? (position / duration) * 100 : 0;

    return (
        <View style={[styles.container, { bottom: isInTabs ? 50 : 0 }]}>
            {/* Progress line at the top */}
            <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>

            <TouchableOpacity
                style={styles.content}
                activeOpacity={0.9}
                onPress={() => router.push('/PlayerModal')}
            >
                <Image
                    source={require('@/assets/images/chill_mood_1768080634061.png')}
                    style={styles.art}
                />

                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
                    <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity onPress={playPrev} style={styles.controlButton}>
                        <Ionicons name="play-skip-back" size={24} color="#FFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => isPlaying ? pauseTrack() : resumeTrack()}
                        style={styles.playButton}
                    >
                        <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#FFF" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={playNext} style={styles.controlButton}>
                        <Ionicons name="play-skip-forward" size={24} color="#FFF" />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity onPress={stopPlayback} style={styles.closeButton}>
                        <Ionicons name="close-circle" size={24} color="rgba(255,255,255,0.5)" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 10,
        right: 10,
        backgroundColor: '#1E1E2E',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(108, 99, 255, 0.2)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        overflow: 'hidden',
        zIndex: 9999,
        marginBottom: 8, // Little gap from bottom
    },
    progressBg: {
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.1)',
        width: '100%',
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    art: {
        width: 45,
        height: 45,
        borderRadius: 8,
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    title: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    artist: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
    },
    controlButton: {
        padding: 8,
    },
    playButton: {
        backgroundColor: COLORS.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
    },
    closeButton: {
        padding: 8,
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 5,
    }
});

export default GlobalMiniPlayer;
