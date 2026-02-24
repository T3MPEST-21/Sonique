import { useTheme } from '@/constants/theme';
import { useLibraryStore } from '@/stores/libraryStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ArtistsScreen = () => {
    const { tracks } = useLibraryStore();
    const { colors, fonts, spacing, cornerRadius, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [sortMode, setSortMode] = useState<'name' | 'count'>('name');

    const artists = useMemo(() => {
        const artistMap = new Map<string, number>();
        tracks.forEach(track => {
            if (track.artist && track.artist !== '<unknown>') {
                artistMap.set(track.artist, (artistMap.get(track.artist) || 0) + 1);
            }
        });

        let result = Array.from(artistMap.entries()).map(([name, count]) => ({ name, count }));

        if (sortMode === 'name') {
            result.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            result.sort((a, b) => b.count - a.count);
        }

        return result;
    }, [tracks, sortMode]);

    const filteredArtists = useMemo(() => {
        if (!searchQuery.trim()) return artists;
        const query = searchQuery.toLowerCase();
        return artists.filter(a => a.name.toLowerCase().includes(query));
    }, [artists, searchQuery]);

    const handlePress = (artist: string) => {
        router.push(`/(tabs)/Artists/${artist}`);
    };

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
                            placeholder="Search artists..."
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
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Artists</Text>
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

            {/* Header Menu Dropdown */}
            {showMenu && (
                <View style={[styles.dropMenu, {
                    backgroundColor: isDark ? '#2a2a2a' : colors.card,
                    borderRadius: cornerRadius,
                    right: spacing.horizontal
                }]}>
                    <View style={styles.dropHeader}>
                        <Text style={[styles.dropTitle, { color: colors.textMuted, fontSize: fonts.xs }]}>SORT BY</Text>
                    </View>

                    <TouchableOpacity style={styles.dropItem} onPress={() => { setSortMode('name'); setShowMenu(false); }}>
                        <Text style={[styles.dropLabel, { color: colors.text, fontSize: fonts.sm }]}>Name (A-Z)</Text>
                        {sortMode === 'name' && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.dropItem} onPress={() => { setSortMode('count'); setShowMenu(false); }}>
                        <Text style={[styles.dropLabel, { color: colors.text, fontSize: fonts.sm }]}>Track Count</Text>
                        {sortMode === 'count' && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={filteredArtists}
                contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.item, { paddingHorizontal: spacing.horizontal }]}
                        onPress={() => handlePress(item.name)}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: colors.backgroundLight, borderRadius: 25 }]}>
                            <Ionicons name="person" size={24} color={colors.primary} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[styles.artistName, { color: colors.text, fontSize: fonts.md }]}>{item.name}</Text>
                            <Text style={[styles.trackCount, { color: colors.textMuted, fontSize: fonts.xs }]}>
                                {item.count} {item.count === 1 ? 'track' : 'tracks'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color={colors.textMuted} style={{ opacity: 0.3 }} />
                        <Text style={[styles.emptyText, { color: colors.textMuted, fontSize: fonts.md }]}>
                            No artists found
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

export default ArtistsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        marginTop: 4,
        zIndex: 1000,
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
    menuBtn: {
        padding: 4,
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
    dropMenu: {
        position: 'absolute',
        top: 60,
        paddingVertical: 6,
        minWidth: 160,
        elevation: 12,
        zIndex: 2000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
    },
    dropHeader: { paddingHorizontal: 16, paddingVertical: 8 },
    dropTitle: { fontWeight: '700', letterSpacing: 0.5 },
    dropItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
    dropLabel: { flex: 1 },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconContainer: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    artistName: {
        fontWeight: 'bold',
    },
    trackCount: {
        marginTop: 2,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        paddingVertical: 100,
    },
    emptyText: {
        fontWeight: '600',
    },
});
