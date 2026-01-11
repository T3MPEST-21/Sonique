import { COLORS } from '@/constants/theme'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React from 'react'
import { Dimensions, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

const { width } = Dimensions.get('window');

const PLAYLISTS = [
  {
    id: '1',
    title: 'Chill Vibes',
    count: '24 Songs',
    duration: '1h 20m',
    image: require('@/assets/images/chill_mood_1768080634061.png'), // Placeholder
    isOffline: true,
    gradient: ['#8e44ad', '#3498db']
  },
  {
    id: '2',
    title: 'Workout Pump',
    count: '15 Songs',
    duration: '45m',
    image: require('@/assets/images/energetic_mood_1768080617113.png'), // Placeholder
    isOffline: false,
    gradient: ['#e67e22', '#e74c3c']
  },
  {
    id: '3',
    title: 'Focus Flow',
    count: '50 Songs',
    duration: '3h 10m',
    image: require('@/assets/images/focus_mood_1768080676224.png'), // Placeholder
    isOffline: false,
    gradient: ['#16a085', '#2980b9']
  },
  {
    id: '4',
    title: 'Late Night Jazz',
    count: '12 Songs',
    duration: '58m',
    image: require('@/assets/images/melancholic_mood_1768080659321.png'), // Placeholder
    isOffline: true,
    gradient: ['#d35400', '#2c3e50']
  },
  {
    id: '5',
    title: 'Road Trip 2024',
    count: '84 Songs',
    duration: '5h 22m',
    image: require('@/assets/images/party_mood_1768080705615.png'), // Placeholder
    isOffline: false,
    gradient: ['#27ae60', '#f1c40f']
  },
  {
    id: '6',
    title: 'Rainy Days',
    count: '30 Songs',
    duration: '1h 45m',
    image: require('@/assets/images/sleepy_mood_1768080726139.png'), // Placeholder
    isOffline: false,
    gradient: ['#7f8c8d', '#bdc3c7']
  },
];

const PlaylistScreen = () => {
  const router = useRouter();

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Playlists</Text>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortText}>Sort</Text>
          <MaterialCommunityIcons name="sort-variant" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="rgba(255,255,255,0.4)" />
        <TextInput
          placeholder="Find a playlist..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          style={styles.searchInput}
        />
      </View>

      {/* Create New Card */}
      <TouchableOpacity style={styles.createCard} activeOpacity={0.8}>
        <View style={styles.createIconContainer}>
          <Ionicons name="add" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.createTextContainer}>
          <Text style={styles.createTitle}>Create New Playlist</Text>
          <Text style={styles.createSubtitle}>Add a new mood mix</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
      </TouchableOpacity>
    </View>
  );

  const renderPlaylistItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.playlistItem} activeOpacity={0.7}>
      <View style={styles.playlistArtContainer}>
        {/* Use Gradient for art placeholder if image fails/we want abstract look, 
                    but simpler to just use Image or View with background color for now per design */}
        <LinearGradient
          colors={item.gradient}
          style={styles.playlistArt}
        />
        {item.isOffline && (
          <View style={styles.offlineBadge}>
            <Ionicons name="checkmark" size={10} color="#FFF" />
          </View>
        )}
      </View>

      <View style={styles.playlistInfo}>
        <Text style={styles.playlistTitle}>{item.title}</Text>
        <Text style={styles.playlistMeta}>{item.count} • {item.duration}</Text>
      </View>

      <TouchableOpacity style={styles.moreButton}>
        <MaterialCommunityIcons name="dots-vertical" size={24} color="rgba(255,255,255,0.5)" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={PLAYLISTS}
        renderItem={renderPlaylistItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

export default PlaylistScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  listContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sortText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
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
  createCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 46, 0.5)',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed', // Dashed border as seen vaguely in design or common for "add" actions
    marginBottom: 10,
  },
  createIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  createTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  createSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  playlistArtContainer: {
    position: 'relative',
  },
  playlistArt: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  offlineBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.backgroundDark,
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 15,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  playlistMeta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  moreButton: {
    padding: 5,
  },
})