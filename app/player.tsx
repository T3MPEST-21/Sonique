import { colors, fonts, screenPadding } from '@/constants/theme';
import { usePlayerStore } from '@/stores/playerStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TrackPlayer, { useProgress } from 'react-native-track-player';

// Simple seek bar that works without Reanimated
const SeekBar = ({
    position,
    duration,
    onSeek,
}: {
    position: number;
    duration: number;
    onSeek: (val: number) => void;
}) => {
    const trackRef = useRef<View>(null);
    // pageX is the absolute screen position of the left edge of the track
    const layoutRef = useRef({ pageX: 0, width: 1 });
    // Keep mutable refs for the closure — panResponder is created once and cannot use stale props
    const durationRef = useRef(duration);
    const onSeekRef = useRef(onSeek);
    durationRef.current = duration;
    onSeekRef.current = onSeek;

    const [isDragging, setIsDragging] = useState(false);
    const [dragRatio, setDragRatio] = useState(0);

    // Use pageX (absolute) so it doesn't matter which child view captures the touch
    const getRatioFromPageX = (pageX: number) => {
        const { pageX: trackX, width } = layoutRef.current;
        const w = width > 0 ? width : 1;
        return Math.max(0, Math.min(1, (pageX - trackX) / w));
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (e) => {
                setIsDragging(true);
                setDragRatio(getRatioFromPageX(e.nativeEvent.pageX));
            },
            onPanResponderMove: (e) => {
                setDragRatio(getRatioFromPageX(e.nativeEvent.pageX));
            },
            onPanResponderRelease: (e) => {
                const ratio = getRatioFromPageX(e.nativeEvent.pageX);
                setIsDragging(false);
                // Use ref so we always have the latest duration, not the frozen initial value
                onSeekRef.current(ratio * durationRef.current);
            },
        })
    ).current;

    const displayRatio = isDragging ? dragRatio : (duration > 0 ? position / duration : 0);

    return (
        <View
            ref={trackRef}
            onLayout={() => {
                // Measure absolute screen position after layout so pageX math works correctly
                trackRef.current?.measure((_fx, _fy, width, _height, pageX, _pageY) => {
                    layoutRef.current = { pageX, width };
                });
            }}
            style={seekBarStyles.track}
            {...panResponder.panHandlers}
        >
            <View style={[seekBarStyles.fill, { width: `${displayRatio * 100}%` }]} />
            <View style={[seekBarStyles.thumb, { left: `${displayRatio * 100}%` as any }]} />
        </View>
    );
};

const seekBarStyles = StyleSheet.create({
    track: {
        height: 20,
        justifyContent: 'center',
        position: 'relative',
    },
    fill: {
        height: 4,
        backgroundColor: colors.primary,
        borderRadius: 2,
    },
    thumb: {
        position: 'absolute',
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: colors.text,
        top: 3,
        marginLeft: -7,
    },
});

const PlayerScreen = () => {
    const { activeTrack, isPlaying, play, pause, resume, next, previous, toggleShuffle, toggleRepeat, repeatMode, isShuffleOn } = usePlayerStore();
    const insets = useSafeAreaInsets();
    const { position, duration } = useProgress();

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const togglePlayback = () => {
        isPlaying ? pause() : resume();
    };

    if (!activeTrack) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={{ color: colors.text }}>No track playing</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-down" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Now Playing</Text>
                <View style={{ width: 28 }} />
            </View>

            <View style={styles.artworkContainer}>
                <View style={styles.artwork}>
                    <Ionicons name="musical-note" size={120} color={colors.textMuted} />
                </View>
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.title} numberOfLines={1}>{activeTrack.title}</Text>
                <Text style={styles.artist} numberOfLines={1}>{activeTrack.artist}</Text>
            </View>

            <View style={styles.progressContainer}>
                <SeekBar
                    position={position}
                    duration={duration}
                    onSeek={(val) => TrackPlayer.seekTo(val)}
                />
                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{formatTime(position)}</Text>
                    <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>
            </View>

            <View style={styles.controlsContainer}>
                <TouchableOpacity onPress={toggleShuffle}>
                    <Ionicons name="shuffle" size={24} color={isShuffleOn ? colors.primary : colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity onPress={previous}>
                    <Ionicons name="play-skip-back" size={32} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
                    <Ionicons name={isPlaying ? "pause" : "play"} size={32} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity onPress={next}>
                    <Ionicons name="play-skip-forward" size={32} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity onPress={toggleRepeat}>
                    <Ionicons name="repeat" size={24} color={repeatMode !== 0 ? colors.primary : colors.textMuted} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default PlayerScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: screenPadding.horizontal,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 20,
    },
    headerTitle: {
        color: colors.text,
        fontSize: fonts.sm,
        fontWeight: '600',
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: colors.textMuted,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 10,
        opacity: 0.5,
    },
    artworkContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    },
    artwork: {
        width: 280,
        height: 280,
        borderRadius: 20,
        backgroundColor: colors.backgroundLight,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
    infoContainer: {
        marginBottom: 32,
        alignItems: 'center',
    },
    title: {
        fontSize: fonts.lg,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    artist: {
        fontSize: fonts.md,
        color: colors.textMuted,
        textAlign: 'center',
    },
    progressContainer: {
        marginBottom: 40,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    timeText: {
        color: colors.textMuted,
        fontSize: fonts.xs,
        fontVariant: ['tabular-nums'],
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 48,
    },
    playButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
