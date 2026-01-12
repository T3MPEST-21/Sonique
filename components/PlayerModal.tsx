import { COLORS } from '@/constants/theme'
import { useAudio } from '@/contexts/AudioContext'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const { width, height } = Dimensions.get('window');

const PlayerModal = () => {
    const router = useRouter();
    const {
        currentTrack,
        isPlaying,
        playTrack,
        pauseTrack,
        resumeTrack,
        playlist,
        playNext,
        playPrev,
        shuffleOn,
        repeatMode,
        toggleShuffle,
        toggleRepeat,
        position,
        duration,
        seek,
        trackOverrides
    } = useAudio();
    const [isLiked, setIsLiked] = useState(false);

    // Helper for Loop Icon
    const getRepeatIcon = () => {
        if (repeatMode === 'ONE') return 'repeat-once';
        if (repeatMode === 'ALL') return 'repeat';
        return 'repeat-off';
    };

    const formatTime = (millis: number) => {
        if (!millis || millis < 0) return "0:00";
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    if (!currentTrack) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: '#FFF' }}>No track playing</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: COLORS.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const progress = duration > 0 ? (position / duration) * 100 : 0;
    const currentMood = (trackOverrides[currentTrack.id]?.mood as string || 'SONIQUE').toUpperCase();

    return (
        <View style={styles.container}>
            {/* Background Gradient */}
            <LinearGradient
                colors={[COLORS.primaryDark, '#0a0a1a']}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <Ionicons name="chevron-down" size={28} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>PLAYING FROM LIBRARY</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="ellipsis-horizontal" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            {/* Album Art */}
            <View style={styles.artworkContainer}>
                <Image
                    source={require('@/assets/images/energetic_mood_1768080617113.png')}
                    style={styles.artwork}
                />
            </View>

            {/* Track Info */}
            <View style={styles.trackInfoContainer}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.trackTitle} numberOfLines={1}>{currentTrack.title}</Text>
                    <Text style={styles.artistName} numberOfLines={1}>{currentTrack.artist}</Text>
                </View>
                <TouchableOpacity onPress={() => setIsLiked(!isLiked)}>
                    <Ionicons
                        name={isLiked ? "heart" : "heart-outline"}
                        size={28}
                        color={isLiked ? COLORS.primary : "#FFF"}
                    />
                </TouchableOpacity>
            </View>

            {/* Mood Tag & Visualizer */}
            <View style={styles.moodAndVis}>
                <View style={styles.moodTagWrapper}>
                    <LinearGradient
                        colors={['rgba(108, 99, 255, 0.2)', 'rgba(108, 99, 255, 0.05)']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.moodTag}
                    >
                        <Text style={styles.moodText}>✨ MOOD: {currentMood}</Text>
                    </LinearGradient>
                </View>

                {/* Simple 5-bar Visualizer */}
                <View style={styles.visualizer}>
                    <View style={[styles.visBar, { height: isPlaying ? 15 : 4 }]} />
                    <View style={[styles.visBar, { height: isPlaying ? 25 : 4, marginHorizontal: 3 }]} />
                    <View style={[styles.visBar, { height: isPlaying ? 20 : 4 }]} />
                    <View style={[styles.visBar, { height: isPlaying ? 30 : 4, marginHorizontal: 3 }]} />
                    <View style={[styles.visBar, { height: isPlaying ? 18 : 4 }]} />
                </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                </View>
                <View style={styles.timeRow}>
                    <Text style={styles.timeText}>{formatTime(position)}</Text>
                    <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>
            </View>

            {/* Controls */}
            <View style={styles.controlsContainer}>
                <TouchableOpacity onPress={toggleShuffle}>
                    <Ionicons name="shuffle" size={24} color={shuffleOn ? COLORS.primary : "rgba(255,255,255,0.7)"} />
                </TouchableOpacity>

                <View style={styles.mainControls}>
                    <TouchableOpacity onPress={playPrev}>
                        <Ionicons name="play-skip-back" size={32} color="#FFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.playButton}
                        onPress={() => isPlaying ? pauseTrack() : resumeTrack()}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[COLORS.primary, '#4a43cc']}
                            style={styles.playButtonGradient}
                        >
                            <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={playNext}>
                        <Ionicons name="play-skip-forward" size={32} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={toggleRepeat}>
                    <MaterialCommunityIcons name={getRepeatIcon()} size={24} color={repeatMode !== 'OFF' ? COLORS.primary : "rgba(255,255,255,0.7)"} />
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.footerItem}>
                    <MaterialCommunityIcons name="cast-connected" size={20} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.footerText}>AirPlay</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerItem}>
                    <MaterialCommunityIcons name="playlist-music" size={20} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.footerText}>Queue</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
    },
    headerButton: {
        padding: 5,
    },
    headerTitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },
    artworkContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    artwork: {
        width: width - 40,
        height: width - 40,
        borderRadius: 20,
        backgroundColor: '#333',
    },
    trackInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        marginTop: 20,
    },
    trackTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 5,
    },
    artistName: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.6)',
    },
    moodAndVis: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 30,
        marginTop: 15,
    },
    moodTagWrapper: {
        alignItems: 'flex-start',
    },
    moodTag: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(108, 99, 255, 0.3)',
    },
    moodText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    visualizer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 30,
    },
    visBar: {
        width: 3,
        backgroundColor: COLORS.primary,
        borderRadius: 1.5,
    },
    progressContainer: {
        paddingHorizontal: 30,
        marginTop: 40,
    },
    progressBarBg: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        width: '100%',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    timeText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontWeight: '500',
    },
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        marginTop: 20,
    },
    mainControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 30,
    },
    playButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 10,
    },
    playButtonGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 40,
        marginTop: 'auto',
        marginBottom: 40,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    footerText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default PlayerModal
