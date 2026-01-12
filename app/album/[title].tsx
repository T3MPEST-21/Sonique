import { COLORS } from '@/constants/theme';
import { Track, useAudio } from '@/contexts/AudioContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const AlbumDetailScreen = () => {
    const { title } = useLocalSearchParams();
    const router = useRouter();
    const { libraryTracks, playTrack, currentTrack, isPlaying } = useAudio();

    const albumTracks = useMemo(() => {
        return libraryTracks.filter(t => (t.albumName || 'Local Audio') === title);
    }, [libraryTracks, title]);

    const renderTrackItem = ({ item, index }: { item: Track; index: number }) => {
        const isCurrent = currentTrack?.id === item.id;
        return (
            <TouchableOpacity
                style={[styles.trackItem, isCurrent && styles.activeTrackItem]}
                onPress={() => playTrack(item, albumTracks)}
            >
                <Text style={styles.trackIndex}>{index + 1}</Text>
                <View style={styles.trackInfo}>
                    <Text style={[styles.trackTitle, isCurrent && { color: COLORS.primary }]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={styles.trackArtist}>{item.artist}</Text>
                </View>
                {isCurrent && isPlaying && (
                    <Ionicons name="stats-chart" size={16} color={COLORS.primary} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#1e1e2e', '#0f0f13']} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <View style={styles.artContainer}>
                        <Ionicons name="disc" size={60} color={COLORS.primary} />
                    </View>
                    <Text style={styles.albumTitle} numberOfLines={1}>{title}</Text>
                    <Text style={styles.trackCount}>{albumTracks.length} Songs</Text>
                </View>
            </LinearGradient>

            <FlatList
                data={albumTracks}
                renderItem={renderTrackItem}
                keyExtractor={t => t.id}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F0F13' },
    header: { padding: 20, paddingTop: 60, alignItems: 'center' },
    backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
    headerContent: { alignItems: 'center' },
    artContainer: { width: 120, height: 120, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    albumTitle: { color: '#FFF', fontSize: 28, fontWeight: '700', textAlign: 'center' },
    trackCount: { color: 'rgba(255,255,255,0.5)', fontSize: 16, marginTop: 5 },
    listContent: { paddingVertical: 10 },
    trackItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20 },
    activeTrackItem: { backgroundColor: 'rgba(108, 99, 255, 0.1)' },
    trackIndex: { color: 'rgba(255,255,255,0.3)', width: 30, fontSize: 14 },
    trackInfo: { flex: 1 },
    trackTitle: { color: '#FFF', fontSize: 16, fontWeight: '500' },
    trackArtist: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 2 },
});

export default AlbumDetailScreen;
