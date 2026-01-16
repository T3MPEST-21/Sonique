import { COLORS } from '@/constants/theme'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Dimensions, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Track, useAudio } from '../../contexts/AudioContext'

const { width, height } = Dimensions.get('window');

const TRACKS = [
  {
    id: '1',
    title: 'Midnight City',
    artist: 'M83 • Hurry Up, We\'re Dreaming',
    image: require('@/assets/images/energetic_mood_1768080617113.png'), // Placeholder
    isDownloaded: true,
    moodColor: '#3498db',
  },
  {
    id: '2',
    title: 'Space Song',
    artist: 'Beach House • Depression Cherry',
    image: require('@/assets/images/chill_mood_1768080634061.png'), // Placeholder
    isDownloaded: false,
    moodColor: '#9b59b6',
  },
  {
    id: '3',
    title: 'Blinding Lights',
    artist: 'The Weeknd • After Hours',
    image: require('@/assets/images/party_mood_1768080705615.png'), // Placeholder
    isDownloaded: true,
    moodColor: '#e74c3c',
  },
  {
    id: '4',
    title: 'Weightless',
    artist: 'Marconi Union • Weightless (Ambient)',
    image: require('@/assets/images/focus_mood_1768080676224.png'), // Placeholder
    isDownloaded: true,
    moodColor: '#3498db',
  },
  {
    id: '5',
    title: 'Resonance',
    artist: 'Home • Odyssey',
    image: require('@/assets/images/sleepy_mood_1768080726139.png'), // Placeholder
    isDownloaded: true,
    moodColor: '#f1c40f',
  },
];

const FILTERS = ['All Moods', 'Calm', 'Energetic', 'Melancholic', 'Focus', 'Workout'];

const LibraryScreen = () => {
  const router = useRouter();
  const {
    currentTrack, isPlaying, playTrack, pauseTrack, loadLocalMusic,
    activeMood, setActiveMood, position, duration, playlists, addTrackToPlaylist
  } = useAudio();
  const [isOnline, setIsOnline] = useState(true);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  // Playlist Modal State
  const [isPlaylistModalVisible, setIsPlaylistModalVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  useEffect(() => {
    const fetchMusic = async () => {
      setLoading(true);
      const localTracks = await loadLocalMusic();
      setTracks(localTracks);
      setLoading(false);
    };
    fetchMusic();
  }, []);

  useEffect(() => {
    if (activeMood === 'All Moods') {
      setFilteredTracks(tracks);
    } else {
      setFilteredTracks(tracks.filter(t => t.mood === activeMood));
    }
  }, [tracks, activeMood]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <View>
          <Text style={styles.moodDetected}>MOOD DETECTED: {activeMood.toUpperCase()}</Text>
          <Text style={styles.headerTitle}>My Library</Text>
        </View>
        {/* Gradient Orb Decoration */}
        <LinearGradient
          colors={[COLORS.primary, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.orb}
        />
      </View>

      {/* Toggle */}
      <View style={styles.toggleContainer}>
        <View style={styles.toggleWrapper}>
          <TouchableOpacity
            style={[styles.toggleButton, isOnline && styles.toggleActive]}
            onPress={() => setIsOnline(true)}
          >
            <Ionicons name="cloud-outline" size={16} color="#FFF" />
            <Text style={styles.toggleText}>Online</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, !isOnline && styles.toggleActive]}
            onPress={() => setIsOnline(false)}
          >
            <Ionicons name="checkmark" size={16} color="rgba(255,255,255,0.5)" />
            <Text style={[styles.toggleText, { color: 'rgba(255,255,255,0.5)' }]}>Offline</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="rgba(255,255,255,0.4)" />
        <TextInput
          placeholder="Search tracks, artists..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          style={styles.searchInput}
        />
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {FILTERS.map((filter, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.filterChip, activeMood === filter && styles.filterChipActive]}
            onPress={() => setActiveMood(filter)}
          >
            <Text style={[styles.filterText, activeMood === filter && styles.filterTextActive]}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const handleAddToPlaylist = (track: Track) => {
    setSelectedTrack(track);
    setIsPlaylistModalVisible(true);
  };

  const selectPlaylist = async (playlistId: string) => {
    if (selectedTrack) {
      await addTrackToPlaylist(playlistId, selectedTrack);
      setIsPlaylistModalVisible(false);
      Alert.alert('Success', `Added ${selectedTrack.title} to playlist`);
    }
  };

  const renderTrackItem = ({ item }: { item: Track }) => (
    <TouchableOpacity
      style={styles.trackItem}
      activeOpacity={0.7}
      onPress={() => playTrack(item, filteredTracks)}
    >
      <View style={[styles.trackImage, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="musical-note" size={24} color="rgba(255,255,255,0.3)" />
      </View>

      <View style={styles.trackInfo}>
        <View style={styles.titleRow}>
          <Text style={[styles.trackTitle, currentTrack?.id === item.id && { color: COLORS.primary }]} numberOfLines={1}>{item.title}</Text>
          {/* Tiny mood dot */}
          <View style={[styles.moodDot, { backgroundColor: COLORS.primary }]} />
        </View>
        <Text style={styles.artistName} numberOfLines={1}>{item.artist}</Text>
      </View>

      <View style={styles.trackActions}>
        <TouchableOpacity onPress={() => handleAddToPlaylist(item)}>
          <MaterialCommunityIcons name="playlist-plus" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialCommunityIcons name="dots-vertical" size={24} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ color: 'rgba(255,255,255,0.6)', marginTop: 20 }}>Scanning your library...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTracks}
            renderItem={renderTrackItem}
            keyExtractor={item => item.id}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Mini Player */}
      <TouchableOpacity
        style={styles.miniPlayer}
        activeOpacity={0.9}
        onPress={() => router.push('/PlayerModal')}
      >
        {/* Progress Line */}
        <View style={styles.progressBar}>
          <View style={{
            width: `${duration > 0 ? (position / duration) * 100 : 0}%`,
            height: '100%',
            backgroundColor: COLORS.primary
          }} />
        </View>

        <View style={styles.playerContent}>
          <View style={[styles.miniArt, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="musical-note" size={20} color="rgba(255,255,255,0.3)" />
          </View>
          <View style={styles.miniInfo}>
            <Text style={styles.miniTitle} numberOfLines={1}>{currentTrack?.title || 'No Track Selected'}</Text>
            <Text style={styles.miniArtist} numberOfLines={1}>{currentTrack?.artist || '...'}</Text>
          </View>

          <View style={styles.miniControls}>
            <TouchableOpacity onPress={pauseTrack}>
              {isPlaying ? (
                <View style={styles.playButton}>
                  <Ionicons name="pause" size={20} color="#FFF" />
                </View>
              ) : (
                <TouchableOpacity onPress={() => currentTrack && playTrack(currentTrack)}>
                  <View style={styles.playButton}>
                    <Ionicons name="play" size={20} color="#FFF" style={{ marginLeft: 2 }} />
                  </View>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {/* Playlist Selector Modal */}
      <Modal
        visible={isPlaylistModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsPlaylistModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsPlaylistModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to Playlist</Text>
              <TouchableOpacity onPress={() => setIsPlaylistModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={playlists}
              keyExtractor={item => item.id}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No playlists created yet</Text>
                  <TouchableOpacity
                    style={styles.createNowButton}
                    onPress={() => {
                      setIsPlaylistModalVisible(false);
                      router.push('/PlaylistScreen');
                    }}
                  >
                    <Text style={styles.createNowText}>Go create one</Text>
                  </TouchableOpacity>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.playlistOption}
                  onPress={() => selectPlaylist(item.id)}
                >
                  <LinearGradient
                    colors={[COLORS.primary, '#9b59b6']}
                    style={styles.playlistThumb}
                  />
                  <Text style={styles.playlistName}>{item.name}</Text>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

export default LibraryScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  listContent: {
    paddingBottom: 100, // Space for mini player
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  moodDetected: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
  },
  orb: {
    width: 50,
    height: 50,
    borderRadius: 25,
    opacity: 0.8,
  },
  toggleContainer: {
    marginBottom: 20,
  },
  toggleWrapper: {
    flexDirection: 'row',
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#FFF',
    height: '100%',
  },
  filterScroll: {
    paddingRight: 20,
    gap: 10,
    paddingBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1E1E2E',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFF',
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
    backgroundColor: 'rgba(30, 30, 46, 0.4)',
    paddingVertical: 10,
    marginHorizontal: 20,
    borderRadius: 16,
  },
  trackImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 15,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  moodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  artistName: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  trackActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  downloadIcon: {

  },

  // Mini Player
  miniPlayer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#1E1E2E',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
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
    padding: 10,
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
    fontWeight: '700',
    fontSize: 14,
  },
  miniArtist: {
    color: 'rgba(255,255,255,0.6)',
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1E2E',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: height * 0.4,
    maxHeight: height * 0.7,
    padding: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  playlistOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  playlistThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 15,
  },
  playlistName: {
    flex: 1,
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginBottom: 15,
  },
  createNowButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  createNowText: {
    color: '#FFF',
    fontWeight: '700',
  },
})