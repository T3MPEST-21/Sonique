import { COLORS } from '@/constants/theme';
import { Track, useAudio } from '@/contexts/AudioContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Dimensions, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const PlaylistDetailScreen = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const {
        playlists, playTrack, currentTrack, isPlaying, pauseTrack,
        removeTrackFromPlaylist, addTrackToPlaylist, loadLocalMusic,
        deletePlaylist, renamePlaylist
    } = useAudio();

    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [allTracks, setAllTracks] = useState<Track[]>([]);
    const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
    const [newName, setNewName] = useState('');

    const playlist = useMemo(() => playlists.find(p => p.id === id), [playlists, id]);

    useEffect(() => {
        const fetchTracks = async () => {
            const tracks = await loadLocalMusic();
            setAllTracks(tracks || []);
        };
        fetchTracks();
    }, []);

    const filteredAvailableTracks = useMemo(() => {
        return allTracks.filter(t =>
            !playlist?.tracks.find(pt => pt.id === t.id) &&
            (t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.artist.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [allTracks, playlist, searchQuery]);

    if (!playlist) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Error</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Playlist not found</Text>
                </View>
            </View>
        );
    }

    const handleRemoveTrack = (trackId: string) => {
        Alert.alert('Remove Track', 'Are you sure you want to remove this track from the playlist?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: () => removeTrackFromPlaylist(playlist.id, trackId) }
        ]);
    };

    const handleAddTrack = async (track: Track) => {
        await addTrackToPlaylist(playlist.id, track);
    };

    const handleDeletePlaylist = () => {
        Alert.alert('Delete Playlist', 'This action cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    await deletePlaylist(playlist.id);
                    router.back();
                }
            }
        ]);
    };

    const handleRename = async () => {
        if (newName.trim()) {
            await renamePlaylist(playlist.id, newName.trim());
            setIsRenameModalVisible(false);
        }
    };

    const renderTrackItem = ({ item }: { item: Track }) => (
        <TouchableOpacity
            style={styles.trackItem}
            activeOpacity={0.7}
            onPress={() => playTrack(item, playlist.tracks)}
        >
            <View style={[styles.trackArt, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="musical-note" size={20} color="rgba(255,255,255,0.2)" />
            </View>
            <View style={styles.trackInfo}>
                <Text style={[styles.trackTitle, currentTrack?.id === item.id && { color: COLORS.primary }]} numberOfLines={1}>
                    {item.title}
                </Text>
                <Text style={styles.trackArtist} numberOfLines={1}>
                    {item.artist || 'Unknown Artist'}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.trackMenuButton}
                onPress={() => {
                    Alert.alert(item.title, 'Choose an action', [
                        { text: 'Remove from Playlist', style: 'destructive', onPress: () => handleRemoveTrack(item.id) },
                        { text: 'Cancel', style: 'cancel' }
                    ]);
                }}
            >
                <Ionicons name="ellipsis-vertical" size={20} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const handlePlayAll = () => {
        if (playlist.tracks.length > 0) {
            playTrack(playlist.tracks[0], playlist.tracks);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.primaryDark, COLORS.backgroundDark]}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.moreButton}
                    onPress={() => {
                        Alert.alert(playlist.name, 'Choose an action', [
                            {
                                text: 'Rename', onPress: () => {
                                    setNewName(playlist.name);
                                    setIsRenameModalVisible(true);
                                }
                            },
                            { text: 'Delete Playlist', style: 'destructive', onPress: handleDeletePlaylist },
                            { text: 'Cancel', style: 'cancel' }
                        ]);
                    }}
                >
                    <Ionicons name="ellipsis-vertical" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={playlist.tracks}
                renderItem={renderTrackItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View style={styles.playlistHeader}>
                        <LinearGradient
                            colors={[COLORS.primary, '#9b59b6']}
                            style={styles.bigArt}
                        >
                            <MaterialCommunityIcons name="playlist-music" size={80} color="rgba(255,255,255,0.5)" />
                        </LinearGradient>
                        <Text style={styles.playlistName}>{playlist.name}</Text>
                        <Text style={styles.playlistStats}>
                            {playlist.tracks.length} Songs • Personal Mix
                        </Text>

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.playAllButton} onPress={handlePlayAll}>
                                <Ionicons name="play" size={24} color="#FFF" />
                                <Text style={styles.playAllText}>Play All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.addSongsButton}
                                onPress={() => setIsAddModalVisible(true)}
                            >
                                <Ionicons name="add" size={24} color={COLORS.primary} />
                                <Text style={styles.addSongsText}>Add Songs</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="music-off" size={64} color="rgba(255,255,255,0.1)" />
                        <Text style={styles.emptyText}>This playlist is empty</Text>
                        <TouchableOpacity
                            style={styles.emptyAddButton}
                            onPress={() => setIsAddModalVisible(true)}
                        >
                            <Text style={styles.emptyAddText}>Start adding songs</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {/* Add Songs Modal */}
            <Modal
                visible={isAddModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsAddModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add Songs</Text>
                        <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                            <Text style={styles.doneText}>Done</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="rgba(255,255,255,0.4)" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search your library..."
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    <FlatList
                        data={filteredAvailableTracks}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.modalList}
                        renderItem={({ item }) => (
                            <View style={styles.modalTrackItem}>
                                <View style={styles.modalTrackInfo}>
                                    <Text style={styles.modalTrackTitle} numberOfLines={1}>{item.title}</Text>
                                    <Text style={styles.modalTrackArtist} numberOfLines={1}>{item.artist}</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={() => handleAddTrack(item)}
                                >
                                    <Ionicons name="add-circle" size={32} color={COLORS.primary} />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </View>
            </Modal>

            {/* Rename Modal */}
            <Modal
                visible={isRenameModalVisible}
                transparent
                animationType="fade"
            >
                <View style={styles.renameOverlay}>
                    <View style={styles.renameContent}>
                        <Text style={styles.renameTitle}>Rename Playlist</Text>
                        <TextInput
                            style={styles.renameInput}
                            value={newName}
                            onChangeText={setNewName}
                            autoFocus
                        />
                        <View style={styles.renameButtons}>
                            <TouchableOpacity onPress={() => setIsRenameModalVisible(false)}>
                                <Text style={styles.renameCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleRename}>
                                <Text style={styles.renameSave}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    listContent: {
        paddingBottom: 100,
    },
    playlistHeader: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 30,
    },
    bigArt: {
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: 20,
        marginBottom: 25,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playlistName: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 8,
    },
    playlistStats: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '500',
        marginBottom: 25,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    playAllButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 30,
        alignItems: 'center',
        gap: 10,
    },
    playAllText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    addSongsButton: {
        flexDirection: 'row',
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(108, 99, 255, 0.2)',
    },
    addSongsText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '700',
    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        paddingVertical: 12,
        marginHorizontal: 20,
        borderRadius: 16,
    },
    trackArt: {
        width: 48,
        height: 48,
        borderRadius: 8,
    },
    trackInfo: {
        flex: 1,
        marginLeft: 15,
    },
    trackTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 2,
    },
    trackArtist: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
    },
    trackMenuButton: {
        padding: 5,
    },
    moreButton: {
        padding: 5,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 16,
        marginTop: 10,
    },
    emptyAddButton: {
        marginTop: 20,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 25,
    },
    emptyAddText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 40,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFF',
    },
    doneText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '700',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        margin: 20,
        paddingHorizontal: 15,
        borderRadius: 12,
        height: 50,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: '#FFF',
        fontSize: 16,
    },
    modalList: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    modalTrackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    modalTrackInfo: {
        flex: 1,
    },
    modalTrackTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    modalTrackArtist: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 2,
    },
    addButton: {
        padding: 5,
    },
    renameOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    renameContent: {
        width: width * 0.85,
        backgroundColor: '#1E1E2E',
        borderRadius: 24,
        padding: 25,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    renameTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 20,
    },
    renameInput: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        color: '#FFF',
        fontSize: 16,
        marginBottom: 25,
    },
    renameButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 20,
    },
    renameCancel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 16,
        fontWeight: '600',
    },
    renameSave: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '700',
    },
});

export default PlaylistDetailScreen;
