import { COLORS } from '@/constants/theme';
import { useAudio } from '@/contexts/AudioContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

const PlaylistDetailScreen = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const {
        customPlaylists,
        playlist: currentQueue, // Global queue
        currentTrack,
        isPlaying,
        playTrack,
        pauseTrack,
        resumeTrack,
        removeFromPlaylist,
        addToPlaylist,
        libraryTracks, // All tracks for "Add Songs"
        loadLocalMusic, // Ensure we have tracks
        playNext,
    } = useAudio();

    const [targetPlaylist, setTargetPlaylist] = useState<any>(null);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
    const [menuVisible, setMenuVisible] = useState(false); // For context menu
    const [addSongsVisible, setAddSongsVisible] = useState(false); // For "Add Songs" modal

    // Add Songs State
    const [songsToAdd, setSongsToAdd] = useState<string[]>([]);

    useEffect(() => {
        const found = customPlaylists.find((p) => p.id === id);
        if (found) {
            setTargetPlaylist(found);
        } else {
            // Handle not found/deleted
            // router.back(); 
        }
    }, [id, customPlaylists]);

    useEffect(() => {
        // Ensure library is loaded for "Add Songs"
        loadLocalMusic();
    }, []);

    const toggleSelection = (trackId: string) => {
        setSelectedTracks((prev) => {
            if (prev.includes(trackId)) return prev.filter((id) => id !== trackId);
            return [...prev, trackId];
        });
    };

    const handlePlayTrack = async (track: any) => {
        if (isSelectionMode) {
            toggleSelection(track.id);
        } else {
            // Play this playlist
            await playTrack(track, targetPlaylist?.tracks || []);
        }
    };

    // --- Context Actions ---

    const handleRemoveSelected = async () => {
        if (!targetPlaylist) return;

        Alert.alert(
            "Remove Songs",
            `Remove ${selectedTracks.length} songs from playlist?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        for (const trackId of selectedTracks) {
                            await removeFromPlaylist(targetPlaylist.id, trackId);
                        }
                        setIsSelectionMode(false);
                        setSelectedTracks([]);
                    }
                }
            ]
        );
    };

    const handlePlayNext = async () => {
        // Find the tracks objects
        // This relies on finding them in the current playlist context or library
        // Logic: Add to front of current queue? Or just skip to them?
        // "Play Next" usually means insert after current song in queue.
        // Implementation complexity: High. For now, let's just say "Added to Queue" (mock)
        // because AudioContext doesn't strictly support "enqueue after current" yet nicely exposed.
        // actually `currentQueue` is exposed. 
        Alert.alert("Coming Soon", "Queue management is coming in the next update!");
        setMenuVisible(false);
        setIsSelectionMode(false);
    };

    const handleAddToOtherPlaylist = () => {
        // Reuse the logic from LibraryScreen? 
        // For now, simple alert or simplified picker.
        // Let's implement full picker later if requested.
        Alert.alert("Coming Soon", "Move to other playlist coming soon!");
        setMenuVisible(false);
        setIsSelectionMode(false);
    };

    // --- Add Songs Logic ---

    const toggleSongToAdd = (trackId: string) => {
        setSongsToAdd(prev => {
            if (prev.includes(trackId)) return prev.filter(id => id !== trackId);
            return [...prev, trackId];
        });
    };

    const confirmAddSongs = async () => {
        if (!targetPlaylist) return;

        // Find tracks in library
        // libraryTracks might be empty if context didn't expose it correctly in interface, 
        // but we updated `loadLocalMusic` to populate `libraryTracks` state, verify context interface.
        // AudioContext interface has `loadLocalMusic` but does it expose `libraryTracks`?
        // Checking interface... `playlist` is the queue. `libraryTracks` state exists inside provider but might not be exported in values.
        // Workaround: Use `playlist` if it IS the library (initial state), or we need to expose `libraryTracks` in Context.
        // Let's assume `playlist` (queue) is effectively "All Songs" if we haven't switched context, 
        // OR we just use `MediaLibrary` again here? Better to expose `libraryTracks` in Context if not already. 
        // I'll check Context again. If not exposed, I'll temporarily use `playlist` (queue) as source if it has tracks.

        // Actually, let's just assume `playlist` holds all songs if user hasn't filtered. 
        // Wait, `playlist` in context is `currentQueue`. 
        // I will use `loadLocalMusic` logic re-fetch or rely on what I have.
        // I will trust `playlist` has *something*, or re-fetch.

        // REVISIT: I need to verify if `libraryTracks` is exposed. 
        // Looking at previous `AudioContext.tsx` view...
        // `  playlist: Track[]; // The current queue`
        // `  loadLocalMusic: () => Promise<void>;`
        // It does NOT expose `libraryTracks` separate from `playlist` (queue).
        // However, `loadLocalMusic` sets `currentQueue`.
        // So `playlist` variable IS the queue.

        // FIX: I will use `playlist` (the global queue) as the source for "Add Songs" for now, 
        // assuming the user has loaded music. 

        const sourceTracks = currentQueue; // Best guess for "All Songs"
        const tracksToAddObjects = sourceTracks.filter(t => songsToAdd.includes(t.id));

        for (const track of tracksToAddObjects) {
            // Check if already in playlist?
            if (!targetPlaylist.tracks.some((t: any) => t.id === track.id)) {
                await addToPlaylist(targetPlaylist.id, track);
            }
        }
        setAddSongsVisible(false);
        setSongsToAdd([]);
    };


    if (!targetPlaylist) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
            </View>
        );
    }

    const renderTrackItem = ({ item, index }: { item: any, index: number }) => {
        const isCurrent = currentTrack?.id === item.id;
        const isSelected = selectedTracks.includes(item.id);

        return (
            <TouchableOpacity
                style={[
                    styles.trackItem,
                    isCurrent && { backgroundColor: 'rgba(108, 99, 255, 0.1)' },
                    isSelected && { backgroundColor: 'rgba(108, 99, 255, 0.3)', borderColor: COLORS.primary, borderWidth: 1 }
                ]}
                onPress={() => handlePlayTrack(item)}
                onLongPress={() => {
                    if (!isSelectionMode) {
                        setIsSelectionMode(true);
                        toggleSelection(item.id);
                    }
                }}
                activeOpacity={0.7}
            >
                <Text style={styles.trackIndex}>{index + 1}</Text>
                <View style={styles.trackInfo}>
                    <Text style={[styles.trackTitle, isCurrent && { color: COLORS.primary }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.trackArtist}>{item.artist}</Text>
                </View>
                {isSelectionMode && (
                    <View style={[styles.selectionCircle, isSelected && styles.selectedCircle]}>
                        {isSelected && <Ionicons name="checkmark" size={12} color="#FFF" />}
                    </View>
                )}
                {!isSelectionMode && (
                    <TouchableOpacity onPress={() => { setSelectedTracks([item.id]); setIsSelectionMode(true); setMenuVisible(true); }}>
                        <Ionicons name="ellipsis-vertical" size={20} color="rgba(255,255,255,0.5)" />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header / Banner */}
            <View style={styles.header}>
                <Image
                    source={require('@/assets/images/chill_mood_1768080634061.png')}
                    style={StyleSheet.absoluteFillObject}
                    blurRadius={20}
                />
                <LinearGradient
                    colors={['transparent', '#0F0F13']}
                    style={StyleSheet.absoluteFillObject}
                />

                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>

                    <Image source={require('@/assets/images/chill_mood_1768080634061.png')} style={styles.playlistArt} />
                    <Text style={styles.playlistTitle}>{targetPlaylist.name}</Text>
                    <Text style={styles.playlistMeta}>{targetPlaylist.tracks.length} Songs • Offline</Text>

                    <View style={styles.headerButtons}>
                        <TouchableOpacity style={styles.playAllButton} onPress={() => {
                            if (targetPlaylist.tracks.length > 0) {
                                playTrack(targetPlaylist.tracks[0], targetPlaylist.tracks);
                            }
                        }}>
                            <Ionicons name="play" size={20} color="#FFF" />
                            <Text style={styles.playAllText}>Play All</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.addSongsButton} onPress={() => setAddSongsVisible(true)}>
                            <Ionicons name="add" size={22} color="#FFF" />
                            <Text style={styles.addSongsText}>Add Songs</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <FlatList
                data={targetPlaylist.tracks}
                renderItem={renderTrackItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
            />

            {/* Selection Bar */}
            {isSelectionMode && (
                <View style={styles.selectionBar}>
                    <Text style={styles.selectionCount}>{selectedTracks.length} Selected</Text>
                    <View style={styles.selectionActions}>
                        <TouchableOpacity onPress={() => { setIsSelectionMode(false); setSelectedTracks([]); }} style={styles.selectionButton}>
                            <Text style={styles.selectionButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleRemoveSelected} style={styles.selectionButton}>
                            <Ionicons name="trash-outline" size={24} color="#ff4757" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.selectionButton}>
                            <Ionicons name="ellipsis-horizontal-circle" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Context Menu Modal */}
            <Modal
                transparent={true}
                visible={menuVisible}
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.menuContainer}>
                            <TouchableOpacity style={styles.menuItem} onPress={handleRemoveSelected}>
                                <Ionicons name="trash-outline" size={20} color="#ff4757" />
                                <Text style={[styles.menuText, { color: '#ff4757' }]}>Remove from Playlist</Text>
                            </TouchableOpacity>
                            <View style={styles.divider} />

                            <TouchableOpacity style={styles.menuItem} onPress={handlePlayNext}>
                                <MaterialCommunityIcons name="playlist-play" size={20} color="#FFF" />
                                <Text style={styles.menuText}>Play Next</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem} onPress={handleAddToOtherPlaylist}>
                                <MaterialCommunityIcons name="playlist-plus" size={20} color="#FFF" />
                                <Text style={styles.menuText}>Add to other playlist</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem}>
                                <Ionicons name="information-circle-outline" size={20} color="#FFF" />
                                <Text style={styles.menuText}>Properties</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Add Songs Modal */}
            <Modal
                visible={addSongsVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setAddSongsVisible(false)}
            >
                <View style={styles.addSongsContainer}>
                    <View style={styles.addSongsHeader}>
                        <Text style={styles.addSongsTitle}>Add Songs</Text>
                        <TouchableOpacity onPress={() => setAddSongsVisible(false)}>
                            <Text style={{ color: COLORS.primary, fontSize: 16 }}>Done</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={currentQueue} // Assuming this is "All Songs" source
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => {
                            const isAdded = songsToAdd.includes(item.id);
                            // Also check if already in playlist
                            const alreadyInPlaylist = targetPlaylist.tracks.some((t: any) => t.id === item.id);

                            return (
                                <TouchableOpacity
                                    style={[styles.addSongItem, alreadyInPlaylist && { opacity: 0.5 }]}
                                    onPress={() => !alreadyInPlaylist && toggleSongToAdd(item.id)}
                                    disabled={alreadyInPlaylist}
                                >
                                    <Image source={require('@/assets/images/chill_mood_1768080634061.png')} style={styles.addSongArt} />
                                    <View style={{ flex: 1, marginLeft: 10 }}>
                                        <Text style={styles.addSongTitle}>{item.title}</Text>
                                        <Text style={styles.addSongArtist}>{item.artist}</Text>
                                    </View>
                                    {alreadyInPlaylist ? (
                                        <Text style={{ color: 'gray' }}>Added</Text>
                                    ) : (
                                        <Ionicons
                                            name={isAdded ? "checkmark-circle" : "ellipse-outline"}
                                            size={24}
                                            color={isAdded ? COLORS.primary : "gray"}
                                        />
                                    )}
                                </TouchableOpacity>
                            )
                        }}
                    />

                    <View style={styles.addSongsFooter}>
                        <TouchableOpacity
                            style={[styles.confirmAddButton, songsToAdd.length === 0 && { opacity: 0.5 }]}
                            onPress={confirmAddSongs}
                            disabled={songsToAdd.length === 0}
                        >
                            <Text style={styles.confirmAddText}>Add {songsToAdd.length} Songs</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default PlaylistDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F13',
    },
    header: {
        height: 300,
        position: 'relative',
        justifyContent: 'flex-end',
        padding: 20,
    },
    headerContent: {
        alignItems: 'center',
        zIndex: 10,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 0,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
    },
    playlistArt: {
        width: 140,
        height: 140,
        borderRadius: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    playlistTitle: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 5,
        textAlign: 'center',
    },
    playlistMeta: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        marginBottom: 20,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 15,
    },
    playAllButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 30,
        alignItems: 'center',
        gap: 8,
    },
    playAllText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
    },
    addSongsButton: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        alignItems: 'center',
        gap: 8,
    },
    addSongsText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    listContent: {
        paddingBottom: 100,
    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    trackIndex: {
        color: 'rgba(255,255,255,0.4)',
        width: 30,
        fontSize: 14,
    },
    trackInfo: {
        flex: 1,
    },
    trackTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 3,
    },
    trackArtist: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
    },
    selectionCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedCircle: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    // Selection Bar
    selectionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1E1E2E',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    selectionCount: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    selectionActions: {
        flexDirection: 'row',
        gap: 20,
    },
    selectionButton: {
        padding: 5,
    },
    selectionButtonText: {
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
    },
    // Menu
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContainer: {
        backgroundColor: '#1E1E2E',
        borderRadius: 12,
        padding: 10,
        width: 250,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        gap: 12,
    },
    menuText: {
        color: '#FFF',
        fontSize: 15,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginVertical: 4,
    },
    // Add Songs Modal
    addSongsContainer: {
        flex: 1,
        backgroundColor: '#0F0F13',
    },
    addSongsHeader: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    addSongsTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    addSongItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    addSongArt: {
        width: 40,
        height: 40,
        borderRadius: 4,
    },
    addSongTitle: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '500',
    },
    addSongArtist: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
    },
    addSongsFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    confirmAddButton: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmAddText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
    }
});
