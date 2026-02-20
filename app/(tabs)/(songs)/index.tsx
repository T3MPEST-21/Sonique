import { SongList } from '@/components/SongList';
import { colors, fonts, screenPadding } from '@/constants/theme';
import { useLibraryStore } from '@/stores/libraryStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SortMode = 'title' | 'artist' | 'default';

const SongsScreen = () => {
    const { tracks, fetchTracks, loadFromCache, isLoading, error, initialized } = useLibraryStore();
    const insets = useSafeAreaInsets();
    const [showMenu, setShowMenu] = useState(false);
    const [sortMode, setSortMode] = useState<SortMode>('default');

    useEffect(() => {
        if (!initialized) loadFromCache();
        fetchTracks();
    }, []);

    const sortedTracks = React.useMemo(() => {
        if (sortMode === 'title') return [...tracks].sort((a, b) => a.title.localeCompare(b.title));
        if (sortMode === 'artist') return [...tracks].sort((a, b) => a.artist.localeCompare(b.artist));
        return tracks;
    }, [tracks, sortMode]);

    if (isLoading && tracks.length === 0) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={{ color: colors.text }}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Songs</Text>
                <TouchableOpacity onPress={() => setShowMenu(v => !v)} style={styles.menuBtn}>
                    <Ionicons name="ellipsis-vertical" size={22} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Drop-down menu */}
            {showMenu && (
                <View style={styles.dropMenu}>
                    {([
                        { key: 'default', label: 'Default Order', icon: 'list' },
                        { key: 'title', label: 'Sort by Title', icon: 'text' },
                        { key: 'artist', label: 'Sort by Artist', icon: 'person' },
                    ] as { key: SortMode; label: string; icon: string }[]).map(item => (
                        <TouchableOpacity
                            key={item.key}
                            style={styles.dropItem}
                            onPress={() => { setSortMode(item.key); setShowMenu(false); }}
                        >
                            <Ionicons
                                name={item.icon as any}
                                size={17}
                                color={sortMode === item.key ? colors.primary : colors.text}
                            />
                            <Text style={[styles.dropLabel, sortMode === item.key && { color: colors.primary }]}>
                                {item.label}
                            </Text>
                            {sortMode === item.key && (
                                <Ionicons name="checkmark" size={16} color={colors.primary} style={{ marginLeft: 'auto' }} />
                            )}
                        </TouchableOpacity>
                    ))}
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.dropItem} onPress={() => { setShowMenu(false); /* shuffle all */ }}>
                        <Ionicons name="shuffle" size={17} color={colors.text} />
                        <Text style={styles.dropLabel}>Shuffle All</Text>
                    </TouchableOpacity>
                </View>
            )}

            <SongList tracks={sortedTracks} />
        </View>
    );
};

export default SongsScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { justifyContent: 'center', alignItems: 'center' },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: screenPadding.horizontal,
        marginBottom: 12,
        marginTop: 4,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.text,
    },
    menuBtn: { padding: 4 },
    dropMenu: {
        position: 'absolute',
        top: 60,
        right: screenPadding.horizontal,
        backgroundColor: '#2a2a2a',
        borderRadius: 12,
        paddingVertical: 6,
        minWidth: 190,
        elevation: 12,
        zIndex: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
    },
    dropItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
    dropLabel: { color: colors.text, fontSize: fonts.sm, flex: 1 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 12, marginVertical: 4 },
});
