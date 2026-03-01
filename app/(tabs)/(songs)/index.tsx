import { SongList } from '@/components/SongList';
import { useTheme } from '@/constants/theme';
import { useLibraryStore } from '@/stores/libraryStore';
import { usePlayerStore } from '@/stores/playerStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SortMode = 'title' | 'artist' | 'default';

const SongsScreen = () => {
    const { tracks, loadFromCache, isLoading, error, initialized, fetchTracks } = useLibraryStore();
    const insets = useSafeAreaInsets();
    const { colors, fonts, spacing, isDark, cornerRadius } = useTheme();
    const [showMenu, setShowMenu] = useState(false);
    const [sortMode, setSortMode] = useState<SortMode>('default');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!initialized) loadFromCache();
    }, []);

    const filteredAndSortedTracks = React.useMemo(() => {
        let result = [...tracks];

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.title.toLowerCase().includes(query) ||
                t.artist.toLowerCase().includes(query)
            );
        }

        // Sort
        if (sortMode === 'title') result.sort((a, b) => a.title.localeCompare(b.title));
        else if (sortMode === 'artist') result.sort((a, b) => a.artist.localeCompare(b.artist));

        return result;
    }, [tracks, sortMode, searchQuery]);

    if (isLoading && tracks.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }, styles.centered]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }, styles.centered]}>
                <Text style={{ color: colors.text, fontSize: fonts.sm }}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <View style={[styles.headerRow, { paddingHorizontal: spacing.horizontal }]}>
                {isSearchActive ? (
                    <View style={styles.searchContainer}>
                        <TouchableOpacity onPress={() => { setIsSearchActive(false); setSearchQuery(''); }} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <TextInput
                            style={[styles.searchInput, { color: colors.text, fontSize: fonts.md }]}
                            placeholder="Search songs..."
                            placeholderTextColor={colors.textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Songs</Text>
                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                onPress={() => setIsSearchActive(true)}
                                style={styles.menuBtn}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="search" size={22} color={colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setShowMenu(true)}
                                style={styles.menuBtn}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>

            {/* Sort Menu Dropdown */}
            {showMenu && (
                <View style={[styles.dropMenu, {
                    backgroundColor: isDark ? '#2a2a2a' : colors.card,
                    borderRadius: cornerRadius,
                    right: spacing.horizontal
                }]}>
                    <View style={styles.dropHeader}>
                        <Text style={[styles.dropTitle, { color: colors.textMuted, fontSize: fonts.xs }]}>SCREEN OPTIONS</Text>
                    </View>

                    <TouchableOpacity style={styles.dropItem} onPress={() => {
                        const shuffled = shuffleArray([...filteredAndSortedTracks]);
                        if (shuffled.length > 0) usePlayerStore.getState().play(shuffled[0], shuffled);
                        setShowMenu(false);
                    }}>
                        <Ionicons name="shuffle" size={18} color={colors.text} />
                        <Text style={[styles.dropLabel, { color: colors.text, fontSize: fonts.sm }]}>Shuffle All</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.dropItem} onPress={() => {
                        fetchTracks();
                        setShowMenu(false);
                    }}>
                        <Ionicons name="refresh" size={18} color={colors.text} />
                        <Text style={[styles.dropLabel, { color: colors.text, fontSize: fonts.sm }]}>Rescan Library</Text>
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.dropHeader}>
                        <Text style={[styles.dropTitle, { color: colors.textMuted, fontSize: fonts.xs }]}>SORT BY</Text>
                    </View>
                    {([
                        { label: 'Recently Added', key: 'default' },
                        { label: 'Title', key: 'title' },
                        { label: 'Artist', key: 'artist' },
                    ] as { label: string, key: SortMode }[]).map((item) => (
                        <TouchableOpacity
                            key={item.key}
                            style={styles.dropItem}
                            onPress={() => { setSortMode(item.key); setShowMenu(false); }}
                        >
                            <Text style={[styles.dropLabel, { color: colors.text, fontSize: fonts.sm }]}>
                                {item.label}
                            </Text>
                            {sortMode === item.key && (
                                <Ionicons name="checkmark" size={16} color={colors.primary} style={{ marginLeft: 'auto' }} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <SongList tracks={filteredAndSortedTracks} />
        </View>
    );
};

// Helper inside file or export from utils
function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export default SongsScreen;

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        marginTop: 4,
        zIndex: 100,
        elevation: 10,
        backgroundColor: 'transparent',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        flex: 1,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        gap: 8,
    },
    backBtn: {
        padding: 4,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontWeight: '500',
    },
    clearBtn: {
        padding: 4,
    },
    menuBtn: { padding: 4 },
    dropMenu: {
        position: 'absolute',
        top: 60,
        paddingVertical: 6,
        minWidth: 190,
        elevation: 12,
        zIndex: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
    },
    dropHeader: { paddingHorizontal: 16, paddingVertical: 8 },
    dropTitle: { fontWeight: '700', letterSpacing: 0.5 },
    dropItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
    dropLabel: { flex: 1 },
    divider: { height: 1, marginHorizontal: 12, marginVertical: 4 },
});
