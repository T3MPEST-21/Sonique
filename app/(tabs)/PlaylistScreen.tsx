import { COLORS } from '@/constants/theme'
import { useAudio } from '@/contexts/AudioContext'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Dimensions, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'

const { width } = Dimensions.get('window');

const PlaylistScreen = () => {
  const router = useRouter();
  const { customPlaylists, createPlaylist, deletePlaylist } = useAudio();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    await createPlaylist(newPlaylistName);
    setNewPlaylistName('');
    setModalVisible(false);
  };

  const handleDeletePlaylist = (id: string) => {
    Alert.alert(
      "Delete Playlist",
      "Are you sure you want to delete this playlist?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deletePlaylist(id) }
      ]
    );
  };

  const filteredPlaylists = customPlaylists.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Create New Card */}
      <TouchableOpacity style={styles.createCard} activeOpacity={0.8} onPress={() => setModalVisible(true)}>
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
    <TouchableOpacity style={styles.playlistItem} activeOpacity={0.7} onPress={() => router.push(`/playlist/${item.id}`)}>
      <View style={styles.playlistArtContainer}>
        <LinearGradient
          colors={['#8e44ad', '#3498db']}
          style={styles.playlistArt}
        />
      </View>

      <View style={styles.playlistInfo}>
        <Text style={styles.playlistTitle}>{item.name}</Text>
        <Text style={styles.playlistMeta}>{item.tracks.length} Songs</Text>
      </View>

      <TouchableOpacity style={styles.moreButton} onPress={() => handleDeletePlaylist(item.id)}>
        <Ionicons name="trash-outline" size={20} color="rgba(255,255,255,0.5)" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredPlaylists}
        renderItem={renderPlaylistItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No playlists yet. Create one!</Text>
          </View>
        }
      />

      {/* Create Playlist Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>New Playlist</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Playlist Name"
                placeholderTextColor="#666"
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCreatePlaylist} style={styles.createButton}>
                  <Text style={styles.createButtonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    borderStyle: 'dashed',
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
    padding: 10,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#252530',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 20,
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#1E1E2E',
    color: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});