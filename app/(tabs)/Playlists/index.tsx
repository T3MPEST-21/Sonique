import { GeneratedArtwork } from '@/components/GeneratedArtwork';
import { colors, fonts, screenPadding } from '@/constants/theme';
import { Playlist, useLibraryStore } from '@/stores/libraryStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
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

type SortMode = 'az' | 'recent';

const PlaylistCard = ({ playlist, onPress, onMenu }: { playlist: Playlist; onPress: () => void; onMenu: () => void }) => {
  const trackCount = playlist.trackIds.length;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {playlist.artworkUri ? (
        <Image source={{ uri: playlist.artworkUri }} style={styles.cardArtwork} />
      ) : (
        <GeneratedArtwork name={playlist.name} size={styles.cardArtwork.width} style={styles.cardArtwork} />
      )}
      <View style={styles.cardFooter}>
        <View style={styles.cardText}>
          <Text style={styles.cardName} numberOfLines={1}>{playlist.name}</Text>
          <Text style={styles.cardCount}>{trackCount} {trackCount === 1 ? 'song' : 'songs'}</Text>
        </View>
        <TouchableOpacity onPress={onMenu} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default function PlaylistsScreen() {
  const insets = useSafeAreaInsets();
  const { playlists, createPlaylist, deletePlaylist } = useLibraryStore();
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [menuPlaylist, setMenuPlaylist] = useState<Playlist | null>(null);

  const sorted = [...playlists].sort((a, b) => {
    if (sortMode === 'az') return a.name.localeCompare(b.name);
    return b.createdAt - a.createdAt;
  });

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const p = createPlaylist(name);
    setNewName('');
    setShowCreate(false);
    router.push(`/(tabs)/Playlists/${p.id}`);
  };

  const handleDelete = (id: string, name: string) => {
    setMenuPlaylist(null);
    Alert.alert(`Delete "${name}"?`, 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePlaylist(id) },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Playlists</Text>
        <TouchableOpacity onPress={() => setShowHeaderMenu(v => !v)} style={styles.headerMenu}>
          <Ionicons name="ellipsis-vertical" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Header context menu */}
      {showHeaderMenu && (
        <View style={styles.dropMenu}>
          <TouchableOpacity style={styles.dropItem} onPress={() => { setShowCreate(true); setShowHeaderMenu(false); }}>
            <Ionicons name="add-circle-outline" size={18} color={colors.text} />
            <Text style={styles.dropLabel}>New Playlist</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropItem} onPress={() => { setSortMode('az'); setShowHeaderMenu(false); }}>
            <Ionicons name="text" size={18} color={sortMode === 'az' ? colors.primary : colors.text} />
            <Text style={[styles.dropLabel, sortMode === 'az' && { color: colors.primary }]}>Sort A–Z</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropItem} onPress={() => { setSortMode('recent'); setShowHeaderMenu(false); }}>
            <Ionicons name="time-outline" size={18} color={sortMode === 'recent' ? colors.primary : colors.text} />
            <Text style={[styles.dropLabel, sortMode === 'recent' && { color: colors.primary }]}>Recently Created</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Playlist grid */}
      <FlatList
        data={sorted}
        numColumns={2}
        keyExtractor={p => p.id}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 140 }}
        renderItem={({ item }) => (
          <PlaylistCard
            playlist={item}
            onPress={() => router.push(`/(tabs)/Playlists/${item.id}`)}
            onMenu={() => setMenuPlaylist(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="musical-notes" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No playlists yet</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowCreate(true)}>
              <Text style={styles.emptyBtnText}>Create one</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreate(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Create playlist modal */}
      <Modal transparent visible={showCreate} animationType="fade" onRequestClose={() => setShowCreate(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowCreate(false)}>
          <Pressable style={styles.createModal} onPress={() => { }}>
            <Text style={styles.createTitle}>New Playlist</Text>
            <TextInput
              style={styles.createInput}
              placeholder="Playlist name"
              placeholderTextColor={colors.textMuted}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              onSubmitEditing={handleCreate}
              returnKeyType="done"
            />
            <View style={styles.createActions}>
              <TouchableOpacity onPress={() => setShowCreate(false)} style={styles.createCancel}>
                <Text style={styles.createCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreate} style={styles.createConfirm}>
                <Text style={styles.createConfirmText}>Create</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Playlist card context menu */}
      {menuPlaylist && (
        <Modal transparent visible animationType="fade" onRequestClose={() => setMenuPlaylist(null)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setMenuPlaylist(null)}>
            <View style={styles.cardMenu}>
              <TouchableOpacity style={styles.cardMenuItem} onPress={() => {
                setMenuPlaylist(null);
                router.push(`/(tabs)/Playlists/${menuPlaylist.id}`);
              }}>
                <Ionicons name="folder-open-outline" size={18} color={colors.text} />
                <Text style={styles.cardMenuLabel}>Open</Text>
              </TouchableOpacity>
              {!menuPlaylist.isPinned && (
                <TouchableOpacity style={styles.cardMenuItem} onPress={() => handleDelete(menuPlaylist.id, menuPlaylist.name)}>
                  <Ionicons name="trash-outline" size={18} color="#e74c3c" />
                  <Text style={[styles.cardMenuLabel, { color: '#e74c3c' }]}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const CARD_SIZE = 160;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: screenPadding.horizontal,
    paddingVertical: 12,
  },
  headerTitle: { color: colors.text, fontSize: fonts.lg, fontWeight: '800' },
  headerMenu: { padding: 4 },
  dropMenu: {
    position: 'absolute',
    top: 60,
    right: screenPadding.horizontal,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingVertical: 6,
    minWidth: 180,
    elevation: 10,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  dropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  dropLabel: { color: colors.text, fontSize: fonts.sm },
  row: { justifyContent: 'space-between', paddingHorizontal: screenPadding.horizontal, marginBottom: 16 },
  card: {
    width: CARD_SIZE,
    backgroundColor: colors.backgroundLight,
    borderRadius: 14,
    overflow: 'hidden',
  },
  cardArtwork: { width: CARD_SIZE, height: CARD_SIZE },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  cardText: { flex: 1 },
  cardName: { color: colors.text, fontSize: fonts.xs, fontWeight: '700' },
  cardCount: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { color: colors.textMuted, fontSize: fonts.md, marginTop: 12 },
  emptyBtn: { marginTop: 20, backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 10 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: fonts.sm },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
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
  createModal: { backgroundColor: '#1e1e1e', borderRadius: 18, padding: 24, width: '85%' },
  createTitle: { color: colors.text, fontSize: fonts.md, fontWeight: '700', marginBottom: 16 },
  createInput: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    padding: 14,
    color: colors.text,
    fontSize: fonts.sm,
    marginBottom: 16,
  },
  createActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  createCancel: { paddingHorizontal: 16, paddingVertical: 10 },
  createCancelText: { color: colors.textMuted, fontSize: fonts.sm },
  createConfirm: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  createConfirmText: { color: '#fff', fontWeight: '700', fontSize: fonts.sm },
  cardMenu: {
    backgroundColor: '#2a2a2a',
    borderRadius: 14,
    padding: 8,
    minWidth: 180,
    alignSelf: 'center',
  },
  cardMenuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  cardMenuLabel: { color: colors.text, fontSize: fonts.sm },
});
