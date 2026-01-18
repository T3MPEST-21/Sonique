import { COLORS } from "@/constants/theme";
import { Track, useAudio } from "@/contexts/AudioContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Dimensions,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    SharedValue,
    useAnimatedReaction,
    useAnimatedRef,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import ActionMenu, { MenuItem } from "../../components/ActionMenu";

const { width, height } = Dimensions.get("window");
const ITEM_HEIGHT = 80;

const DraggableTrackItem = ({
  item,
  index,
  count,
  currentTrackId,
  onPlay,
  onMenu,
  activeId,
  positions,
  onMove,
  isManual,
}: {
  item: Track;
  index: number;
  count: number;
  currentTrackId?: string;
  onPlay: (item: Track) => void;
  onMenu: (item: Track) => void;
  activeId: SharedValue<string | null>;
  positions: SharedValue<Record<string, number>>;
  onMove: (id: string, newIndex: number) => void;
  isManual: boolean;
}) => {
  const isPlaying = currentTrackId === item.id;
  const top = useSharedValue(index * ITEM_HEIGHT);
  const isDragging = useSharedValue(false);
  const dragY = useSharedValue(0);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  useAnimatedReaction(
    () => positions.value[item.id],
    (newPos, prevPos) => {
      if (
        newPos !== undefined &&
        newPos !== prevPos &&
        activeId.value !== item.id
      ) {
        top.value = withSpring(newPos * ITEM_HEIGHT);
      }
    },
  );

  const gesture = Gesture.Pan()
    .enabled(isManual)
    .activateAfterLongPress(1200)
    .onStart(() => {
      runOnJS(triggerHaptic)();
      isDragging.value = true;
      activeId.value = item.id;
    })
    .onUpdate((e) => {
      dragY.value = e.translationY;
      const currentPos = positions.value[item.id] * ITEM_HEIGHT + dragY.value;
      const newIndex = Math.max(
        0,
        Math.min(Math.round(currentPos / ITEM_HEIGHT), count - 1),
      );

      if (newIndex !== positions.value[item.id]) {
        runOnJS(onMove)(item.id, newIndex);
      }
    })
    .onFinalize(() => {
      top.value = withSpring(positions.value[item.id] * ITEM_HEIGHT);
      dragY.value = withSpring(0);
      isDragging.value = false;
      activeId.value = null;
    });

  const animatedStyle = useAnimatedStyle(() => {
    const isThisActive = activeId.value === item.id;
    return {
      top: isThisActive
        ? positions.value[item.id] * ITEM_HEIGHT + dragY.value
        : top.value,
      zIndex: isThisActive ? 100 : 1,
      transform: [{ scale: withSpring(isThisActive ? 1.05 : 1) }],
      shadowOpacity: withSpring(isThisActive ? 0.3 : 0),
      backgroundColor: isThisActive ? "rgba(255,255,255,0.05)" : "transparent",
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.draggableTrackItem, animatedStyle]}>
        <View style={styles.trackArtContainer}>
          {item.artwork ? (
            <ExpoImage source={{ uri: item.artwork }} style={styles.trackArt} />
          ) : (
            <View
              style={[
                styles.trackArt,
                {
                  backgroundColor: "#333",
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <Ionicons
                name="musical-note"
                size={20}
                color="rgba(255,255,255,0.2)"
              />
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.trackInfo}
          onPress={() => onPlay(item)}
          disabled={isDragging.value}
        >
          <Text
            style={[styles.trackTitle, isPlaying && { color: COLORS.primary }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {item.artist || "Unknown Artist"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.trackMenuButton}
          onPress={() => onMenu(item)}
          disabled={isDragging.value}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color="rgba(255,255,255,0.3)"
          />
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
};

const PlaylistDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const {
    playlists,
    playTrack,
    currentTrack,
    isPlaying,
    pauseTrack,
    removeTrackFromPlaylist,
    addTrackToPlaylist,
    loadLocalMusic,
    deletePlaylist,
    renamePlaylist,
    updatePlaylistArtwork,
    reloadLibrary,
    reorderPlaylistTrack,
  } = useAudio();

  const activeId = useSharedValue<string | null>(null);
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [newName, setNewName] = useState("");

  // Menu States
  const [isPlaylistMenuVisible, setIsPlaylistMenuVisible] = useState(false);
  const [isTrackMenuVisible, setIsTrackMenuVisible] = useState(false);
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    type: string;
    direction: "asc" | "desc";
  }>({ type: "manual", direction: "asc" });

  const playlist = useMemo(
    () => playlists.find((p) => p.id === id),
    [playlists, id],
  );

  const sortedTracks = useMemo(() => {
    if (!playlist) return [];
    if (sortConfig.type === "manual") return playlist.tracks;

    let result = [...playlist.tracks];

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.type) {
        case "name":
          comparison = a.title.localeCompare(b.title);
          break;
        case "date":
          comparison = (a.creationTime || 0) - (b.creationTime || 0);
          break;
        case "length":
          comparison = (a.duration || 0) - (b.duration || 0);
          break;
      }
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
    return result;
  }, [playlist, sortConfig]);

  const positions = useSharedValue<Record<string, number>>({});

  useEffect(() => {
    if (playlist) {
      positions.value = Object.fromEntries(
        playlist.tracks.map((t, i) => [t.id, i]),
      );
    }
  }, [playlist]);

  const handleManualMove = (id: string, newIndex: number) => {
    const oldIndex = positions.value[id];
    if (oldIndex === undefined || oldIndex === newIndex) return;

    const newPositions = { ...positions.value };
    for (const trackId in newPositions) {
      if (trackId === id) continue;
      if (oldIndex < newIndex) {
        if (
          newPositions[trackId] > oldIndex &&
          newPositions[trackId] <= newIndex
        ) {
          newPositions[trackId]--;
        }
      } else {
        if (
          newPositions[trackId] < oldIndex &&
          newPositions[trackId] >= newIndex
        ) {
          newPositions[trackId]++;
        }
      }
    }
    newPositions[id] = newIndex;
    positions.value = newPositions;
    if (playlist) {
      reorderPlaylistTrack(playlist.id, oldIndex, newIndex);
    }
  };

  useEffect(() => {
    const fetchTracks = async () => {
      const tracks = await loadLocalMusic();
      setAllTracks(tracks || []);
    };
    fetchTracks();
  }, []);

  const filteredAvailableTracks = useMemo(() => {
    return allTracks.filter(
      (t) =>
        !playlist?.tracks.find((pt) => pt.id === t.id) &&
        (t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.artist.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [allTracks, playlist, searchQuery]);

  if (!playlist) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
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
    Alert.alert(
      "Remove Track",
      "Are you sure you want to remove this track from the playlist?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeTrackFromPlaylist(playlist.id, trackId),
        },
      ],
    );
  };

  const handleAddTrack = async (track: Track) => {
    await addTrackToPlaylist(playlist.id, track);
  };

  const handleDeletePlaylist = () => {
    Alert.alert("Delete Playlist", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deletePlaylist(playlist.id);
          router.back();
        },
      },
    ]);
  };

  const handleRename = async () => {
    if (newName.trim()) {
      await renamePlaylist(playlist.id, newName.trim());
      setIsRenameModalVisible(false);
    }
  };

  const handleChangeArtwork = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      await updatePlaylistArtwork(playlist.id, result.assets[0].uri);
    }
  };

  const renderTrackItem = ({ item }: { item: Track }) => (
    <TouchableOpacity
      style={styles.trackItem}
      activeOpacity={0.7}
      onPress={() =>
        playTrack(item, sortedTracks, false, {
          type: "playlist",
          id: playlist.id,
        })
      }
    >
      <View
        style={[
          styles.trackArt,
          {
            backgroundColor: "#333",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          },
        ]}
      >
        {item.artwork ? (
          <ExpoImage
            source={{ uri: item.artwork }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <Ionicons
            name="musical-note"
            size={20}
            color="rgba(255,255,255,0.2)"
          />
        )}
      </View>
      <View style={styles.trackInfo}>
        <Text
          style={[
            styles.trackTitle,
            currentTrack?.id === item.id && { color: COLORS.primary },
          ]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {item.artist || "Unknown Artist"}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.trackMenuButton}
        onPress={() => {
          setActiveTrack(item);
          setIsTrackMenuVisible(true);
        }}
      >
        <Ionicons
          name="ellipsis-vertical"
          size={20}
          color="rgba(255,255,255,0.3)"
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const playlistMenuItems: MenuItem[] = [
    { label: "Select Songs", icon: "checkbox-outline", onPress: () => {} },
    {
      label: "Sort: Manual",
      icon: "reorder-three-outline",
      onPress: () => setSortConfig({ type: "manual", direction: "asc" }),
    },
    {
      label: "Sort: Name (A-Z)",
      icon: "text",
      onPress: () => setSortConfig({ type: "name", direction: "asc" }),
    },
    {
      label: "Sort: Name (Z-A)",
      icon: "text",
      onPress: () => setSortConfig({ type: "name", direction: "desc" }),
    },
    {
      label: "Sort: Date (Newest)",
      icon: "calendar-outline",
      onPress: () => setSortConfig({ type: "date", direction: "desc" }),
    },
    {
      label: "Sort: Date (Oldest)",
      icon: "calendar-outline",
      onPress: () => setSortConfig({ type: "date", direction: "asc" }),
    },
    {
      label: "Sort: Length (Longest)",
      icon: "time-outline",
      onPress: () => setSortConfig({ type: "length", direction: "desc" }),
    },
    {
      label: "Sort: Length (Shortest)",
      icon: "time-outline",
      onPress: () => setSortConfig({ type: "length", direction: "asc" }),
    },
    {
      label: "Rename Playlist",
      icon: "create-outline",
      onPress: () => {
        setNewName(playlist.name);
        setIsRenameModalVisible(true);
      },
    },
    {
      label: "Change Artwork",
      icon: "image-outline",
      onPress: handleChangeArtwork,
    },
    {
      label: "Refresh Playlist",
      icon: "refresh",
      onPress: async () => await reloadLibrary(),
    },
    {
      label: "Delete Playlist",
      icon: "trash-outline",
      destructive: true,
      onPress: handleDeletePlaylist,
    },
  ];

  const trackMenuItems: MenuItem[] = [
    {
      label: "Remove from Playlist",
      icon: "close-circle-outline",
      destructive: true,
      onPress: () => activeTrack && handleRemoveTrack(activeTrack.id),
    },
    { label: "Share Track", icon: "share-social-outline", onPress: () => {} },
    {
      label: "Track Details",
      icon: "information-circle-outline",
      onPress: () => {
        if (activeTrack) {
          Alert.alert(
            activeTrack.title,
            `Artist: ${activeTrack.artist}\nMood: ${activeTrack.mood || "N/A"}\nDuration: ${Math.floor(activeTrack.duration / 60000)}m ${Math.floor((activeTrack.duration % 60000) / 1000)}s`,
          );
        }
      },
    },
  ];

  const handlePlayAll = () => {
    if (sortedTracks.length > 0) {
      playTrack(sortedTracks[0], sortedTracks, false, {
        type: "playlist",
        id: playlist.id,
      });
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.backgroundDark]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => setIsPlaylistMenuVisible(true)}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.listContent,
          { height: Math.max(height, sortedTracks.length * ITEM_HEIGHT + 600) },
        ]}
        scrollEventThrottle={16}
      >
        <View style={styles.playlistHeader}>
          {playlist.artworkUri ? (
            <ExpoImage
              source={{ uri: playlist.artworkUri }}
              style={styles.bigArtImage}
              transition={300}
            />
          ) : (
            <LinearGradient
              colors={[COLORS.primary, "#9b59b6"]}
              style={styles.bigArt}
            >
              <MaterialCommunityIcons
                name="playlist-music"
                size={80}
                color="rgba(255,255,255,0.5)"
              />
            </LinearGradient>
          )}
          <Text style={styles.playlistName}>{playlist.name}</Text>
          <Text style={styles.playlistStats}>
            {playlist.tracks.length} Songs • Personal Mix
          </Text>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.playAllButton}
              onPress={handlePlayAll}
            >
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

        {sortedTracks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="music-off"
              size={64}
              color="rgba(255,255,255,0.1)"
            />
            <Text style={styles.emptyText}>This playlist is empty</Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={() => setIsAddModalVisible(true)}
            >
              <Text style={styles.emptyAddText}>Start adding songs</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={[
              styles.tracksContainer,
              { height: sortedTracks.length * ITEM_HEIGHT },
            ]}
          >
            {sortConfig.type === "manual"
              ? playlist.tracks.map((item, index) => (
                  <DraggableTrackItem
                    key={item.id}
                    item={item}
                    index={index}
                    count={playlist.tracks.length}
                    currentTrackId={currentTrack?.id}
                    onPlay={(t) =>
                      playTrack(t, playlist.tracks, false, {
                        type: "playlist",
                        id: playlist.id,
                      })
                    }
                    onMenu={(t) => {
                      setActiveTrack(t);
                      setIsTrackMenuVisible(true);
                    }}
                    activeId={activeId}
                    positions={positions}
                    onMove={handleManualMove}
                    isManual={true}
                  />
                ))
              : sortedTracks.map((item, index) => (
                  <View
                    key={item.id}
                    style={[
                      styles.trackItem,
                      { position: "static", marginHorizontal: 20 },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.trackContent}
                      onPress={() =>
                        playTrack(item, sortedTracks, false, {
                          type: "playlist",
                          id: playlist.id,
                        })
                      }
                    >
                      <View style={styles.trackArtContainer}>
                        {item.artwork ? (
                          <ExpoImage
                            source={{ uri: item.artwork }}
                            style={styles.trackArt}
                          />
                        ) : (
                          <View
                            style={[
                              styles.trackArt,
                              {
                                backgroundColor: "#333",
                                justifyContent: "center",
                                alignItems: "center",
                              },
                            ]}
                          >
                            <Ionicons
                              name="musical-note"
                              size={20}
                              color="rgba(255,255,255,0.2)"
                            />
                          </View>
                        )}
                      </View>
                      <View style={styles.trackInfo}>
                        <Text
                          style={[
                            styles.trackTitle,
                            currentTrack?.id === item.id && {
                              color: COLORS.primary,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text style={styles.trackArtist} numberOfLines={1}>
                          {item.artist || "Unknown Artist"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.trackMenuButton}
                      onPress={() => {
                        setActiveTrack(item);
                        setIsTrackMenuVisible(true);
                      }}
                    >
                      <Ionicons
                        name="ellipsis-vertical"
                        size={20}
                        color="rgba(255,255,255,0.3)"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
          </View>
        )}
      </Animated.ScrollView>

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
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.modalList}
            renderItem={({ item }) => (
              <View style={styles.modalTrackItem}>
                <View style={styles.modalTrackInfo}>
                  <Text style={styles.modalTrackTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.modalTrackArtist} numberOfLines={1}>
                    {item.artist}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleAddTrack(item)}
                >
                  <Ionicons
                    name="add-circle"
                    size={32}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </Modal>

      {/* Rename Modal */}
      <Modal visible={isRenameModalVisible} transparent animationType="fade">
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

      <ActionMenu
        visible={isPlaylistMenuVisible}
        onClose={() => setIsPlaylistMenuVisible(false)}
        title={playlist.name}
        items={playlistMenuItems}
      />

      <ActionMenu
        visible={isTrackMenuVisible}
        onClose={() => setIsTrackMenuVisible(false)}
        title={activeTrack?.title || "Track Actions"}
        items={trackMenuItems}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 100,
  },
  playlistHeader: {
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E2E",
  },
  bigArtImage: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 20,
    marginBottom: 25,
  },
  playlistName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 8,
  },
  playlistStats: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "500",
    marginBottom: 25,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  playAllButton: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    gap: 10,
  },
  playAllText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  addSongsButton: {
    flexDirection: "row",
    backgroundColor: "rgba(108, 99, 255, 0.1)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(108, 99, 255, 0.2)",
  },
  addSongsText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    paddingVertical: 12,
    borderRadius: 16,
  },
  draggableTrackItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    height: ITEM_HEIGHT,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    marginHorizontal: 20,
    borderRadius: 16,
    position: "absolute",
    left: 0,
    right: 0,
  },
  tracksContainer: {
    position: "relative",
  },
  trackContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  trackArtContainer: {
    width: 48,
    height: 48,
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
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },
  trackMenuButton: {
    padding: 5,
  },
  moreButton: {
    padding: 5,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    color: "rgba(255,255,255,0.3)",
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
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
  },
  doneText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    margin: 20,
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: "#FFF",
    fontSize: 16,
  },
  modalList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  modalTrackItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.03)",
  },
  modalTrackInfo: {
    flex: 1,
  },
  modalTrackTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
  modalTrackArtist: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
  },
  addButton: {
    padding: 5,
  },
  renameOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  renameContent: {
    width: width * 0.85,
    backgroundColor: "#1E1E2E",
    borderRadius: 24,
    padding: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  renameTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 20,
  },
  renameInput: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    color: "#FFF",
    fontSize: 16,
    marginBottom: 25,
  },
  renameButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 20,
  },
  renameCancel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 16,
    fontWeight: "600",
  },
  renameSave: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
  },
});

export default PlaylistDetailScreen;
