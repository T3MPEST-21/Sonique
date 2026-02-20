import { GeneratedArtwork } from '@/components/GeneratedArtwork';
import { PlaylistPickerModal } from '@/components/PlaylistPickerModal';
import { SongList } from '@/components/SongList';
import { colors, fonts, screenPadding } from '@/constants/theme';
import { SortBy, useLibraryStore } from '@/stores/libraryStore';
import { usePlayerStore } from '@/stores/playerStore';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PlaylistDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const {
        playlists, getPlaylistTracks, tracks,
        renamePlaylist, deletePlaylist, setPlaylistArtwork,
        removeTrackFromPlaylist, reorderPlaylistTracks, sortPlaylist,
    } = useLibraryStore();
    const { play } = usePlayerStore();

    const playlist = playlists.find(p => p.id === id);

    const [reorderMode, setReorderMode] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [showRename, setShowRename] = useState(false);
    const [newName, setNewName] = useState('');
    const [showSongPicker, setShowSongPicker] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Hold-to-accelerate refs
    const holdInterval = useRef<NodeJS.Timeout | null>(null);
    const holdStart = useRef(0);

    const clearHold = () => {
        if (holdInterval.current) {
            clearInterval(holdInterval.current);
            holdInterval.current = null;
        }
    };

    const startHold = (action: () => void) => {
        holdStart.current = Date.now();
        action(); // immediate first step
        holdInterval.current = setInterval(() => {
            const elapsed = Date.now() - holdStart.current;
            const interval = elapsed > 600 ? 80 : 300;
            // Re-schedule at the new speed every 80ms check
            action();
        }, 80); // fire every 80ms but only count as step when threshold passes
    };

    const handleMoveUp = (index: number) => {
        if (index === 0 || !id) return;
        reorderPlaylistTracks(id, index, index - 1);
    };

    const handleMoveDown = (index: number) => {
        const playlistTracks = getPlaylistTracks(id!);
        if (index >= playlistTracks.length - 1 || !id) return;
        reorderPlaylistTracks(id, index, index + 1);
    };

    const handlePickArtwork = async () => {
        setShowMenu(false);
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
            setPlaylistArtwork(id!, result.assets[0].uri);
        }
    };

    const handleRename = () => {
        const name = newName.trim();
        if (name && id) renamePlaylist(id, name);
        setShowRename(false);
        setNewName('');
    };

    const handleDelete = () => {
        setShowMenu(false);
        Alert.alert(`Delete "${playlist?.name}"?`, 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: () => {
                    if (id) deletePlaylist(id);
                    router.back();
                }
            },
        ]);
    };

    const handleSort = (by: SortBy) => {
        if (id) sortPlaylist(id, by);
        setShowSortMenu(false);
        setShowMenu(false);
    };

    if (!playlist) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={{ color: colors.text }}>Playlist not found</Text>
            </View>
        );
    }

    const playlistTracks = getPlaylistTracks(playlist.id);
    const totalDuration = playlistTracks.reduce((sum, t) => sum + (t.duration || 0), 0);
    const durationStr = totalDuration > 0
        ? `${Math.floor(totalDuration / 60)} min`
        : '0 min';

    // For song picker: show all tracks NOT already in playlist
    const pickerTracks = tracks.filter(t => !playlist.trackIds.includes(t.id));

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>

                {reorderMode ? (
                    <>
                        <Text style={styles.headerTitle}>Reorder</Text>
                        <TouchableOpacity onPress={() => setReorderMode(false)} style={styles.doneBtn}>
                            <Text style={styles.doneBtnText}>Done</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.headerTitle} numberOfLines={1}>{playlist.name}</Text>
                        <TouchableOpacity onPress={() => setShowMenu(v => !v)}>
                            <Ionicons name="ellipsis-vertical" size={22} color={colors.text} />
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {/* ⋮ Dropdown menu */}
            {showMenu && (
                <View style={styles.dropMenu}>
                    <TouchableOpacity style={styles.dropItem} onPress={() => { setShowMenu(false); setShowRename(true); setNewName(playlist.name); }}>
                        <Ionicons name="pencil-outline" size={17} color={colors.text} />
                        <Text style={styles.dropLabel}>Rename</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dropItem} onPress={handlePickArtwork}>
                        <Ionicons name="image-outline" size={17} color={colors.text} />
                        <Text style={styles.dropLabel}>Change Artwork</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dropItem} onPress={() => setShowSortMenu(v => !v)}>
                        <Ionicons name="swap-vertical" size={17} color={colors.text} />
                        <Text style={styles.dropLabel}>Sort...</Text>
                    </TouchableOpacity>
                    {showSortMenu && (
                        <>
                            {(['title', 'artist', 'duration', 'dateAdded'] as SortBy[]).map(s => (
                                <TouchableOpacity key={s} style={[styles.dropItem, styles.subItem]} onPress={() => handleSort(s)}>
                                    <Text style={styles.subLabel}>
                                        {s === 'title' ? 'By Title' : s === 'artist' ? 'By Artist' : s === 'duration' ? 'By Duration' : 'By Date Added'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </>
                    )}
                    <TouchableOpacity style={styles.dropItem} onPress={() => { setShowMenu(false); setReorderMode(true); }}>
                        <Ionicons name="reorder-three" size={17} color={colors.text} />
                        <Text style={styles.dropLabel}>Reorder Songs...</Text>
                    </TouchableOpacity>
                    {!playlist.isPinned && (
                        <TouchableOpacity style={styles.dropItem} onPress={handleDelete}>
                            <Ionicons name="trash-outline" size={17} color="#e74c3c" />
                            <Text style={[styles.dropLabel, { color: '#e74c3c' }]}>Delete Playlist</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Playlist info */}
            <View style={styles.info}>
                <TouchableOpacity onPress={handlePickArtwork}>
                    {playlist.artworkUri ? (
                        <Image source={{ uri: playlist.artworkUri }} style={styles.artwork} />
                    ) : (
                        <GeneratedArtwork name={playlist.name} size={120} style={styles.artwork} />
                    )}
                    <View style={styles.artworkOverlay}>
                        <Ionicons name="camera-outline" size={18} color="rgba(255,255,255,0.8)" />
                    </View>
                </TouchableOpacity>
                <View style={styles.infoText}>
                    <Text style={styles.playlistName} numberOfLines={2}>{playlist.name}</Text>
                    <Text style={styles.playlistMeta}>{playlistTracks.length} songs · {durationStr}</Text>
                    {playlistTracks.length > 0 && (
                        <TouchableOpacity
                            style={styles.playBtn}
                            onPress={() => playlistTracks.length > 0 && play(playlistTracks[0], playlistTracks)}
                        >
                            <Ionicons name="play" size={16} color="#fff" />
                            <Text style={styles.playBtnText}>Play All</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Song list */}
            <SongList
                tracks={playlistTracks}
                reorderMode={reorderMode}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
            />

            {/* Add Songs FAB */}
            {!reorderMode && (
                <TouchableOpacity style={styles.fab} onPress={() => setShowSongPicker(true)}>
                    <Ionicons name="add" size={26} color="#fff" />
                </TouchableOpacity>
            )}

            {/* Rename modal */}
            <Modal transparent visible={showRename} animationType="fade" onRequestClose={() => setShowRename(false)}>
                <Pressable style={styles.modalBackdrop} onPress={() => setShowRename(false)}>
                    <Pressable style={styles.renameModal} onPress={() => { }}>
                        <Text style={styles.renameTitle}>Rename Playlist</Text>
                        <TextInput
                            style={styles.renameInput}
                            value={newName}
                            onChangeText={setNewName}
                            autoFocus
                            onSubmitEditing={handleRename}
                            returnKeyType="done"
                            placeholderTextColor={colors.textMuted}
                            selectionColor={colors.primary}
                            style={[styles.renameInput, { color: colors.text }]}
                        />
                        <View style={styles.renameActions}>
                            <TouchableOpacity onPress={() => setShowRename(false)} style={styles.renameCancel}>
                                <Text style={{ color: colors.textMuted }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleRename} style={styles.renameConfirm}>
                                <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Song picker bottom sheet */}
            {showSongPicker && (
                <PlaylistPickerModal
                    visible={showSongPicker}
                    trackIds={Array.from(selectedIds)}
                    onClose={() => { setShowSongPicker(false); setSelectedIds(new Set()); }}
                    onDone={() => setSelectedIds(new Set())}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: { marginRight: 8, padding: 4 },
    headerTitle: { flex: 1, color: colors.text, fontSize: fonts.md, fontWeight: '700' },
    doneBtn: { backgroundColor: colors.primary, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 6 },
    doneBtnText: { color: '#fff', fontWeight: '700', fontSize: fonts.xs },
    dropMenu: {
        position: 'absolute',
        top: 60,
        right: 16,
        backgroundColor: '#2a2a2a',
        borderRadius: 12,
        paddingVertical: 6,
        minWidth: 200,
        elevation: 12,
        zIndex: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
    },
    dropItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
    dropLabel: { color: colors.text, fontSize: fonts.sm },
    subItem: { paddingLeft: 44, paddingVertical: 8 },
    subLabel: { color: colors.textMuted, fontSize: fonts.xs },
    info: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: screenPadding.horizontal,
        paddingVertical: 16,
        gap: 16,
    },
    artwork: { width: 120, height: 120, borderRadius: 14 },
    artworkOverlay: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderRadius: 12,
        padding: 5,
    },
    infoText: { flex: 1 },
    playlistName: { color: colors.text, fontSize: fonts.md, fontWeight: '800', marginBottom: 4 },
    playlistMeta: { color: colors.textMuted, fontSize: fonts.xs },
    playBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
        backgroundColor: colors.primary,
        alignSelf: 'flex-start',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    playBtnText: { color: '#fff', fontWeight: '700', fontSize: fonts.xs },
    fab: {
        position: 'absolute',
        bottom: 90,
        right: 24,
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
    },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    renameModal: { backgroundColor: '#1e1e1e', borderRadius: 18, padding: 24, width: '85%' },
    renameTitle: { color: colors.text, fontSize: fonts.md, fontWeight: '700', marginBottom: 14 },
    renameInput: {
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 10,
        padding: 14,
        fontSize: fonts.sm,
        marginBottom: 16,
    },
    renameActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
    renameCancel: { paddingHorizontal: 16, paddingVertical: 10 },
    renameConfirm: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
});
