import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
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
import { COLORS } from "../constants/theme";
import { Track, useAudio } from "../contexts/AudioContext";

const { height, width } = Dimensions.get("window");
const ITEM_HEIGHT = 70;

interface QueueViewProps {
  visible: boolean;
  onClose: () => void;
}

const DraggableItem = ({
  item,
  index,
  count,
  currentTrackId,
  playbackSource,
  onPlay,
  onRemove,
  activeId,
  positions,
  onMove,
}: {
  item: Track;
  index: number;
  count: number;
  currentTrackId?: string;
  playbackSource: any;
  onPlay: (item: Track) => void;
  onRemove: (id: string) => void;
  activeId: SharedValue<string | null>;
  positions: SharedValue<Record<string, number>>;
  onMove: (id: string, newIndex: number) => void;
}) => {
  const isPlaying = currentTrackId === item.id;
  const top = useSharedValue(index * ITEM_HEIGHT);
  const isDragging = useSharedValue(false);
  const dragY = useSharedValue(0);

  // Disable reordering for library source
  const canReorder = playbackSource?.type !== "library";

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
    .enabled(canReorder)
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
      <Animated.View style={[styles.trackItem, animatedStyle]}>
        <TouchableOpacity
          style={styles.trackContent}
          onPress={() => onPlay(item)}
          disabled={isDragging.value}
        >
          <View style={styles.trackInfo}>
            <Text
              style={[
                styles.trackTitle,
                isPlaying && { color: COLORS.primary },
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={styles.trackArtist} numberOfLines={1}>
              {item.artist}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onRemove(item.id)}
          style={styles.removeButton}
        >
          <Ionicons
            name="close-circle-outline"
            size={22}
            color="rgba(255,255,255,0.3)"
          />
        </TouchableOpacity>

        {canReorder && (
          <View style={styles.dragIndicator}>
            <MaterialCommunityIcons
              name="drag-vertical"
              size={20}
              color="rgba(255,255,255,0.2)"
            />
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
};

const QueueView: React.FC<QueueViewProps> = ({ visible, onClose }) => {
  const {
    queue,
    currentTrack,
    playTrack,
    removeFromQueue,
    moveQueueItem,
    playbackSource,
  } = useAudio();
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const activeId = useSharedValue<string | null>(null);

  const positions = useSharedValue<Record<string, number>>(
    Object.fromEntries(queue.map((t, i) => [t.id, i])),
  );

  useEffect(() => {
    positions.value = Object.fromEntries(queue.map((t, i) => [t.id, i]));
  }, [queue]);

  const handleMove = (id: string, newIndex: number) => {
    const oldIndex = positions.value[id];
    if (oldIndex === newIndex) return;

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
    moveQueueItem(oldIndex, newIndex);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.overlay} />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Up Next</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="chevron-down" size={28} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Animated.ScrollView
            ref={scrollViewRef}
            contentContainerStyle={[
              styles.listContent,
              { height: queue.length * ITEM_HEIGHT + 100 },
            ]}
          >
            {queue.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Queue is empty</Text>
              </View>
            ) : (
              queue.map((item, index) => (
                <DraggableItem
                  key={item.id}
                  item={item}
                  index={index}
                  count={queue.length}
                  currentTrackId={currentTrack?.id}
                  playbackSource={playbackSource}
                  onPlay={(t) => {
                    playTrack(t);
                    onClose();
                  }}
                  onRemove={removeFromQueue}
                  activeId={activeId}
                  positions={positions}
                  onMove={handleMove}
                />
              ))
            )}
          </Animated.ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  content: {
    height: height * 0.7,
    backgroundColor: "#161622",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
    position: "relative",
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    position: "absolute",
    left: 20,
    padding: 5,
  },
  listContent: {
    paddingBottom: 40,
    position: "relative",
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    height: ITEM_HEIGHT,
    paddingHorizontal: 24,
    position: "absolute",
    left: 0,
    right: 0,
    borderRadius: 16,
  },
  trackContent: {
    flex: 1,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },
  removeButton: {
    padding: 8,
  },
  dragIndicator: {
    marginLeft: 10,
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 16,
  },
});

export default QueueView;
