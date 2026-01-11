import { COLORS } from '@/constants/theme'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

const { width } = Dimensions.get('window');

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
  const [isOnline, setIsOnline] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Calm');

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
          <Text style={styles.moodDetected}>MOOD DETECTED: CALM</Text>
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
            style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTrackItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.trackItem} activeOpacity={0.7}>
      <Image source={item.image} style={styles.trackImage} />

      <View style={styles.trackInfo}>
        <View style={styles.titleRow}>
          <Text style={styles.trackTitle}>{item.title}</Text>
          {/* Tiny mood dot */}
          <View style={[styles.moodDot, { backgroundColor: item.moodColor }]} />
        </View>
        <Text style={styles.artistName} numberOfLines={1}>{item.artist}</Text>
      </View>

      <View style={styles.trackActions}>
        {item.isDownloaded && (
          <View style={styles.downloadIcon}>
            <Ionicons name="checkmark-circle" size={16} color="#2ecc71" />
          </View>
        )}
        <TouchableOpacity>
          <MaterialCommunityIcons name="dots-vertical" size={24} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <FlatList
          data={TRACKS}
          renderItem={renderTrackItem}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Mini Player */}
      <TouchableOpacity
        style={styles.miniPlayer}
        activeOpacity={0.9}
        onPress={() => router.push('/PlayerModal')}
      >
        {/* Progress Line */}
        <View style={styles.progressBar}>
          <View style={{ width: '30%', height: '100%', backgroundColor: COLORS.primary }} />
        </View>

        <View style={styles.playerContent}>
          <Image source={require('@/assets/images/chill_mood_1768080634061.png')} style={styles.miniArt} />
          <View style={styles.miniInfo}>
            <Text style={styles.miniTitle}>Intro - The XX</Text>
            <Text style={styles.miniArtist}>XX</Text>
          </View>

          <View style={styles.miniControls}>
            <TouchableOpacity>
              <Ionicons name="play-skip-back" size={24} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.playButton}>
              <Ionicons name="pause" size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="play-skip-forward" size={24} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
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
})