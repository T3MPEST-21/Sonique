import { COLORS } from "@/constants/theme";
import { useAudio } from "@/contexts/AudioContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ActionMenu, { MenuItem } from "../../components/ActionMenu";

const { width } = Dimensions.get("window");

const PlaylistScreen = () => {
  const router = useRouter();
  const {
    playlists,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    updatePlaylistArtwork,
  } = useAudio();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [isPlaylistMenuVisible, setIsPlaylistMenuVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(
    null,
  );
  const [renameValue, setRenameValue] = useState("");
  const [activePlaylist, setActivePlaylist] = useState<any>(null);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert("Error", "Please enter a name for your playlist");
      return;
    }
    await createPlaylist(newPlaylistName.trim());
    setNewPlaylistName("");
    setIsCreateModalVisible(false);
  };

  const handleRenamePlaylist = async () => {
    if (editingPlaylistId && renameValue.trim()) {
      await renamePlaylist(editingPlaylistId, renameValue.trim());
      setIsRenameModalVisible(false);
      setEditingPlaylistId(null);
      setRenameValue("");
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Playlist",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deletePlaylist(id),
        },
      ],
    );
  };

  const handleChangeArtwork = async (playlistId: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      await updatePlaylistArtwork(playlistId, result.assets[0].uri);
    }
  };

  const playlistMenuItems: MenuItem[] = activePlaylist
    ? [
        {
          label: "Rename Playlist",
          icon: "create-outline",
          onPress: () => {
            setEditingPlaylistId(activePlaylist.id);
            setRenameValue(activePlaylist.name);
            setIsRenameModalVisible(true);
          },
        },
        {
          label: "Change Artwork",
          icon: "image-outline",
          onPress: () => handleChangeArtwork(activePlaylist.id),
        },
        {
          label: "Sort Tracks",
          icon: "swap-vertical-outline",
          onPress: () => {},
        },
        {
          label: "Delete Playlist",
          icon: "trash-outline",
          destructive: true,
          onPress: () => handleDelete(activePlaylist.id, activePlaylist.name),
        },
      ]
    : [];

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.navButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Playlists</Text>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortText}>Sort</Text>
          <MaterialCommunityIcons
            name="sort-variant"
            size={20}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Search Placeholder */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="rgba(255,255,255,0.4)" />
        <TextInput
          placeholder="Find a playlist..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          style={styles.searchInput}
        />
      </View>

      {/* Create New Card */}
      <TouchableOpacity
        style={styles.createCard}
        activeOpacity={0.8}
        onPress={() => setIsCreateModalVisible(true)}
      >
        <View style={styles.createIconContainer}>
          <Ionicons name="add" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.createTextContainer}>
          <Text style={styles.createTitle}>Create New Playlist</Text>
          <Text style={styles.createSubtitle}>Add a new mood mix</Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color="rgba(255,255,255,0.3)"
        />
      </TouchableOpacity>
    </View>
  );

  const getGradientForPlaylist = (index: number): [string, string] => {
    const gradients: [string, string][] = [
      [COLORS.primary, "#9b59b6"],
      ["#3498db", "#2980b9"],
      ["#e67e22", "#d35400"],
      ["#1abc9c", "#16a085"],
      ["#f1c40f", "#f39c12"],
    ];
    return gradients[index % gradients.length];
  };

  const renderPlaylistItem = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => (
    <TouchableOpacity
      style={styles.playlistCard}
      activeOpacity={0.8}
      onPress={() => router.push(`/playlist/${item.id}`)}
    >
      {item.artworkUri ? (
        <Image
          source={{ uri: item.artworkUri }}
          style={styles.playlistCardImage}
        />
      ) : (
        <LinearGradient
          colors={getGradientForPlaylist(index)}
          style={styles.playlistCardGradient}
        >
          <MaterialCommunityIcons
            name="playlist-music"
            size={32}
            color="rgba(255,255,255,0.8)"
          />
        </LinearGradient>
      )}

      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.cardMeta}>{item.tracks.length} Tracks</Text>
      </View>

      <TouchableOpacity
        style={styles.cardMenu}
        onPress={() => {
          setActivePlaylist(item);
          setIsPlaylistMenuVisible(true);
        }}
      >
        <Ionicons
          name="ellipsis-vertical"
          size={16}
          color="rgba(255,255,255,0.6)"
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={playlists}
        renderItem={renderPlaylistItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="music-note-off"
              size={64}
              color="rgba(255,255,255,0.1)"
            />
            <Text style={styles.emptyText}>No playlists yet</Text>
          </View>
        }
      />

      {/* Create Modal */}
      <Modal
        visible={isCreateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Playlist</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Playlist name"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsCreateModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleCreatePlaylist}
              >
                <Text style={styles.saveButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rename Modal */}
      <Modal
        visible={isRenameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsRenameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rename Playlist</Text>
            <TextInput
              style={styles.modalInput}
              value={renameValue}
              onChangeText={setRenameValue}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsRenameModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleRenamePlaylist}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ActionMenu
        visible={isPlaylistMenuVisible}
        onClose={() => setIsPlaylistMenuVisible(false)}
        title={activePlaylist?.name || "Playlist Settings"}
        items={playlistMenuItems}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  listContent: {
    paddingBottom: 100,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  playlistCard: {
    width: (width - 45) / 2, // Slightly adjusted for better spacing
    backgroundColor: "rgba(30, 30, 46, 0.4)",
    borderRadius: 20,
    marginBottom: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  playlistCardGradient: {
    width: "100%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  playlistCardImage: {
    width: "100%",
    aspectRatio: 1,
  },
  cardInfo: {
    padding: 12,
  },
  cardTitle: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  cardMeta: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontWeight: "500",
  },
  cardMenu: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  sortText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E2E",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#FFF",
    height: "100%",
  },
  createCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30, 30, 46, 0.5)",
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(108, 99, 255, 0.2)",
    borderStyle: "dashed",
    marginBottom: 10,
  },
  createIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(108, 99, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  createTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  createTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 2,
  },
  createSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 16,
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1E1E2E",
    width: "100%",
    borderRadius: 24,
    padding: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    height: 55,
    paddingHorizontal: 20,
    color: "#FFF",
    fontSize: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 15,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default PlaylistScreen;
