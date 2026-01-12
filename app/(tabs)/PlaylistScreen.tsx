import { COLORS } from '@/constants/theme';
import { useAudio } from '@/contexts/AudioContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

const { width } = Dimensions.get('window');

const PlaylistScreen = () => {
  const router = useRouter();
  const { customPlaylists, createPlaylist, deletePlaylist } = useAudio();
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
        data={customPlaylists}
        renderItem={renderPlaylistItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {renderHeader()}
            <View style={styles.smartPlaylistContainer}>
              <TouchableOpacity style={[styles.smartCard, { backgroundColor: '#4834d4' }]} onPress={() => router.push('/playlist/favorites')}>
                <LinearGradient colors={['#686de0', '#4834d4']} style={StyleSheet.absoluteFillObject} />
                <Ionicons name="heart" size={24} color="#FFF" />
                <Text style={styles.smartCardTitle}>Liked Songs</Text>
                <Text style={styles.smartCardSubtitle}>Your favorites</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.smartCard, { backgroundColor: '#20bf6b' }]} onPress={() => router.push('/playlist/recent')}>
                <LinearGradient colors={['#26de81', '#20bf6b']} style={StyleSheet.absoluteFillObject} />
                <MaterialCommunityIcons name="clock-time-four" size={24} color="#FFF" />
                <Text style={styles.smartCardTitle}>Recently Added</Text>
                <Text style={styles.smartCardSubtitle}>Fresh tunes</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Playlists</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No custom playlists. Create one!</Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
      >
        <LinearGradient
          colors={[COLORS.primary, '#4834d4']}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={32} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>

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
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  playlistArtContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 15,
  },
  playlistArt: {
    flex: 1,
    borderRadius: 12,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  playlistMeta: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  moreButton: {
    padding: 5,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E1E2E',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
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
  smartPlaylistContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 15,
    marginBottom: 25,
    marginTop: 10,
  },
  smartCard: {
    flex: 1,
    height: 100,
    borderRadius: 16,
    padding: 15,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    position: 'relative',
  },
  smartCardTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 5,
  },
  smartCardSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});