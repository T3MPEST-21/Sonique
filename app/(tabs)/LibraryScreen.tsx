import MetadataEditModal from '@/components/MetadataEditModal';
import { COLORS } from '@/constants/theme';
import { Track, useAudio } from '@/contexts/AudioContext';
import { fuzzySearch } from '@/utils/search';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

const { width } = Dimensions.get('window');

const FILTERS = ['All Moods', 'Calm', 'Energetic', 'Melancholic', 'Focus', 'Workout'];

const LibraryScreen = () => {
  const router = useRouter();
  const {
    loadLocalMusic,
    playlist,
    currentTrack,
    playTrack,
    isPlaying,
    pauseTrack,
    resumeTrack,
    customPlaylists,
    libraryTracks,
    addToPlaylist,
    addTracksToPlaylist,
    trackOverrides,
    updateTrackMetadata,
  } = useAudio();
  const [isOnline, setIsOnline] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All Moods');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [activeTab, setActiveTab] = useState<'tracks' | 'artists' | 'albums'>('tracks');

  // Menu & Sorting State
  const [menuVisible, setMenuVisible] = useState(false);
  const [sortBy, setSortBy] = useState<'title' | 'date' | 'duration'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Selection Mode
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]); // Track IDs
  const [playlistPickerVisible, setPlaylistPickerVisible] = useState(false);

  useEffect(() => {
    loadLocalMusic();
  }, []);

  // Derived State: Filtered & Sorted Playlist
  const filteredAndSortedPlaylist = useMemo(() => {
    // 1. Fuzzy Search
    let filtered = fuzzySearch(libraryTracks, searchQuery, ['title', 'artist']);

    // 2. Mood Filter
    if (activeFilter !== 'All Moods') {
      filtered = filtered.filter(track => {
        const mood = trackOverrides[track.id]?.mood;
        return mood === activeFilter.toLowerCase();
      });
    }

    // 3. Sort
    if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'date') {
      filtered.sort((a, b) => (a.modificationTime || 0) - (b.modificationTime || 0));
    } else if (sortBy === 'duration') {
      filtered.sort((a, b) => a.duration - b.duration);
    }

    if (sortOrder === 'desc') {
      filtered.reverse();
    }
    return filtered;
  }, [libraryTracks, searchQuery, activeFilter, trackOverrides, sortBy, sortOrder]);

  const groupedArtists = useMemo(() => {
    const groups: Record<string, Track[]> = {};
    libraryTracks.forEach(track => {
      const artist = track.artist || 'Unknown Artist';
      if (!groups[artist]) groups[artist] = [];
      groups[artist].push(track);
    });
    return Object.entries(groups).map(([name, tracks]) => ({ name, tracks })).sort((a, b) => a.name.localeCompare(b.name));
  }, [libraryTracks]);

  const groupedAlbums = useMemo(() => {
    const groups: Record<string, Track[]> = {};
    libraryTracks.forEach(track => {
      const album = track.albumName || 'Local Audio';
      if (!groups[album]) groups[album] = [];
      groups[album].push(track);
    });
    return Object.entries(groups).map(([title, tracks]) => ({ title, tracks })).sort((a, b) => a.title.localeCompare(b.title));
  }, [libraryTracks]);

  const handleSort = (type: 'title' | 'date' | 'duration') => {
    if (sortBy === type) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('asc');
    }
    setMenuVisible(false);
  };

  const handleRefresh = async () => {
    setMenuVisible(false);
    await loadLocalMusic();
  };

  const toggleSelection = (trackId: string) => {
    setSelectedTracks(prev => {
      if (prev.includes(trackId)) {
        return prev.filter(id => id !== trackId);
      } else {
        return [...prev, trackId];
      }
    });
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    const targetPlaylist = customPlaylists.find(p => p.id === playlistId);
    if (!targetPlaylist) return;

    // Find track objects
    const tracksToAdd = playlist.filter(t => selectedTracks.includes(t.id));

    for (const track of tracksToAdd) {
      await addToPlaylist(playlistId, track);
    }

    setPlaylistPickerVisible(false);
    setIsSelectionMode(false);
    setSelectedTracks([]);
    Alert.alert("Success", `Added ${tracksToAdd.length} songs to ${targetPlaylist.name}`);
  };

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Library</Text>

        <View style={styles.headerActions}>
          {/* Tab Selector */}
          <View style={styles.tabSelector}>
            {(['tracks', 'artists', 'albums'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Menu Button */}
          <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
            <Ionicons name="ellipsis-vertical" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="rgba(255,255,255,0.4)" />
        <TextInput
          placeholder="Search tracks, artists..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips - Only show for Tracks tab for now */}
      {activeTab === 'tracks' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderArtistItem = ({ item }: { item: { name: string; tracks: Track[] } }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => router.push(`/artist/${encodeURIComponent(item.name)}` as any)}
    >
      <View style={styles.categoryArtContainer}>
        <Ionicons name="person" size={24} color={COLORS.primary} />
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryTitle}>{item.name}</Text>
        <Text style={styles.categorySubtitle}>{item.tracks.length} Songs</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
    </TouchableOpacity>
  );

  const renderAlbumItem = ({ item }: { item: { title: string; tracks: Track[] } }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => router.push(`/album/${encodeURIComponent(item.title)}` as any)}
    >
      <View style={styles.categoryArtContainer}>
        <Ionicons name="disc" size={24} color={COLORS.primary} />
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryTitle}>{item.title}</Text>
        <Text style={styles.categorySubtitle}>{item.tracks.length} Songs</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
    </TouchableOpacity>
  );

  const renderTrackItem = ({ item }: { item: Track }) => {
    const isCurrent = currentTrack?.id === item.id;
    const isSelected = selectedTracks.includes(item.id);
    const overrides = trackOverrides[item.id] || {};
    const displayTitle = overrides.title || item.title;
    const displayArtist = overrides.artist || item.artist;
    const itemMood = overrides.mood;

    return (
      <TouchableOpacity
        style={[
          styles.trackItem,
          isCurrent && { backgroundColor: 'rgba(108, 99, 255, 0.1)' },
          isSelected && { backgroundColor: 'rgba(108, 99, 255, 0.3)', borderColor: COLORS.primary, borderWidth: 1 }
        ]}
        onPress={() => {
          if (isSelectionMode) {
            toggleSelection(item.id);
          } else {
            playTrack(item, filteredAndSortedPlaylist);
          }
        }}
        onLongPress={() => {
          if (!isSelectionMode) {
            setIsSelectionMode(true);
            toggleSelection(item.id);
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.trackArtContainer}>
          <Image source={require('@/assets/images/chill_mood_1768080634061.png')} style={styles.trackArt} />
          {!isSelectionMode && <View style={[styles.moodDot, { backgroundColor: COLORS.primary }]} />}
          {isSelectionMode && (
            <View style={[styles.selectionCircle, isSelected && styles.selectedCircle]}>
              {isSelected && <Ionicons name="checkmark" size={12} color="#FFF" />}
            </View>
          )}
        </View>

        <View style={styles.trackInfo}>
          <Text style={[styles.trackTitle, isCurrent && { color: COLORS.primary }]} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.trackArtist}>{item.artist}</Text>
        </View>

        {/* Download/Offline Status */}
        {!isSelectionMode && (
          <View style={styles.trackActions}>
            <Ionicons name="cloud-done" size={20} color={COLORS.primary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={activeTab === 'tracks' ? filteredAndSortedPlaylist : activeTab === 'artists' ? groupedArtists : groupedAlbums}
        renderItem={activeTab === 'tracks' ? renderTrackItem : activeTab === 'artists' ? renderArtistItem as any : renderAlbumItem as any}
        keyExtractor={(item: any) => item.id || item.name || item.title}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Selection Action Bar */}
      {isSelectionMode && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionCount}>{selectedTracks.length} Selected</Text>
          <View style={styles.selectionActions}>
            {selectedTracks.length === 1 && (
              <TouchableOpacity
                onPress={() => setEditingTrack(playlist.find(t => t.id === selectedTracks[0]) || null)}
                style={styles.selectionButton}
              >
                <Ionicons name="pencil" size={20} color="#6C63FF" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setIsSelectionMode(false)} style={styles.selectionButton}>
              <Text style={styles.selectionButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPlaylistPickerVisible(true)}
              style={[styles.selectionButton, styles.primarySelectionButton]}
              disabled={selectedTracks.length === 0}
            >
              <Text style={[styles.selectionButtonText, { color: '#FFF' }]}>Add to Playlist</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}



      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.menuContainer}>
              <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); setIsSelectionMode(!isSelectionMode); }}>
                <Ionicons name="checkbox-outline" size={20} color="#FFF" />
                <Text style={styles.menuText}>Select / Mark</Text>
              </TouchableOpacity>
              <View style={styles.divider} />

              <TouchableOpacity style={styles.menuItem} onPress={handleRefresh}>
                <Ionicons name="refresh" size={20} color="#FFF" />
                <Text style={styles.menuText}>Refresh Library</Text>
              </TouchableOpacity>
              <View style={styles.divider} />

              <Text style={styles.menuHeader}>Sort By</Text>
              <TouchableOpacity style={styles.menuItem} onPress={() => handleSort('title')}>
                <MaterialCommunityIcons name="sort-alphabetical-ascending" size={20} color={sortBy === 'title' ? COLORS.primary : "#FFF"} />
                <Text style={[styles.menuText, sortBy === 'title' && { color: COLORS.primary }]}>Name {sortBy === 'title' && (sortOrder === 'asc' ? '(A-Z)' : '(Z-A)')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => handleSort('date')}>
                <MaterialCommunityIcons name="calendar-clock" size={20} color={sortBy === 'date' ? COLORS.primary : "#FFF"} />
                <Text style={[styles.menuText, sortBy === 'date' && { color: COLORS.primary }]}>Date {sortBy === 'date' && (sortOrder === 'asc' ? '(Oldest)' : '(Newest)')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => handleSort('duration')}>
                <MaterialCommunityIcons name="clock-outline" size={20} color={sortBy === 'duration' ? COLORS.primary : "#FFF"} />
                <Text style={[styles.menuText, sortBy === 'duration' && { color: COLORS.primary }]}>Duration {sortBy === 'duration' && (sortOrder === 'asc' ? '(Shortest)' : '(Longest)')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Playlist Picker Modal */}
      <Modal
        visible={playlistPickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPlaylistPickerVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setPlaylistPickerVisible(false)}>
          <View style={styles.bottomModalOverlay}>
            <View style={styles.bottomSheet}>
              <Text style={styles.bottomSheetTitle}>Add to Playlist</Text>
              {customPlaylists.length === 0 ? (
                <Text style={styles.emptyText}>No playlists created yet.</Text>
              ) : (
                <FlatList
                  data={customPlaylists}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.playlistOption} onPress={() => handleAddToPlaylist(item.id)}>
                      <MaterialCommunityIcons name="playlist-music" size={24} color={COLORS.primary} />
                      <Text style={styles.playlistOptionText}>{item.name}</Text>
                      <Text style={styles.playlistOptionCount}>{item.tracks.length} songs</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
              <TouchableOpacity style={styles.closeButton} onPress={() => setPlaylistPickerVisible(false)}>
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Metadata Edit Modal */}
      <MetadataEditModal
        visible={!!editingTrack}
        track={editingTrack!}
        onClose={() => {
          setEditingTrack(null);
          setIsSelectionMode(false);
          setSelectedTracks([]);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F13',
    paddingTop: 30,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 3,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 17,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
  },
  tabButtonText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#FFF',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 4,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  toggleActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  toggleText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFF',
  },
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 45,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    marginLeft: 10,
    fontSize: 15,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    gap: 10,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterContent: {
    paddingRight: 20,
    gap: 10,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterTextActive: {
    color: '#FFF',
  },
  menuButton: {
    padding: 5,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  categoryArtContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 15,
  },
  categoryTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  categorySubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    marginTop: 2,
  },
  filterText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFF',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 100, // For mini player
    paddingHorizontal: 20,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginBottom: 10,
    padding: 10,
    borderRadius: 12,
  },
  trackArtContainer: {
    position: 'relative',
  },
  trackArt: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  moodDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#1E1E2E',
  },
  selectionCircle: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#FFF',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCircle: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  trackActions: {
    marginLeft: 10,
  },
  miniPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.textPrimaryDark,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: '100%',
  },
  playerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  miniArt: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  miniInfo: {
    flex: 1,
    marginLeft: 12,
  },
  miniTitle: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  miniArtist: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  miniControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Menu Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 20,
  },
  menuContainer: {
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    padding: 10,
    width: 200,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 12,
  },
  menuText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  menuHeader: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 4,
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
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 15,
  },
  selectionCount: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  selectionActions: {
    flexDirection: 'row',
    gap: 15,
  },
  selectionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  primarySelectionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  selectionButtonText: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    fontSize: 14,
  },
  // Bottom Sheet (Simple)
  bottomModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#1E1E2E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  bottomSheetTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  playlistOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  playlistOptionText: {
    color: '#FFF',
    fontSize: 16,
    flex: 1,
    marginLeft: 15,
  },
  playlistOptionCount: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
  },
  closeButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  closeButtonText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginBottom: 20
  }
});

export default LibraryScreen;