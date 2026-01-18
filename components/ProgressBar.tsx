import React, { useEffect } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from "react-native-reanimated";
import { COLORS } from "../constants/theme";

const { width } = Dimensions.get("window");
const SLIDER_WIDTH = width - 60; // Matching paddingHorizontal: 30

interface ProgressBarProps {
  position: number;
  duration: number;
  onSeek: (millis: number) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  position,
  duration,
  onSeek,
}) => {
  const isDragging = useSharedValue(false);
  const dragX = useSharedValue(0);
  const progress = useSharedValue(0);

  // Sync progress with external position if not dragging
  useEffect(() => {
    if (!isDragging.value && duration > 0) {
      progress.value = (position / duration) * SLIDER_WIDTH;
    }
  }, [position, duration]);

  const gesture = Gesture.Pan()
    .onBegin((e) => {
      isDragging.value = true;
      progress.value = Math.max(0, Math.min(e.x, SLIDER_WIDTH));
    })
    .onUpdate((e) => {
      progress.value = Math.max(0, Math.min(e.x, SLIDER_WIDTH));
    })
    .onFinalize(() => {
      const newPosition = (progress.value / SLIDER_WIDTH) * duration;
      runOnJS(onSeek)(newPosition);
      isDragging.value = false;
    });

  const tapGesture = Gesture.Tap().onEnd((e) => {
    const tappedProgress = Math.max(0, Math.min(e.x, SLIDER_WIDTH));
    const newPosition = (tappedProgress / SLIDER_WIDTH) * duration;
    progress.value = tappedProgress;
    runOnJS(onSeek)(newPosition);
  });

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: progress.value,
  }));

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: progress.value - 8 },
      { scale: withSpring(isDragging.value ? 1.5 : 1) },
    ],
    backgroundColor: isDragging.value ? COLORS.primary : "#FFF",
  }));

  const formatTime = (millis: number) => {
    const totalSeconds = millis / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // No-op - removed crashing derived value

  return (
    <View style={styles.container}>
      <GestureDetector gesture={Gesture.Exclusive(gesture, tapGesture)}>
        <View style={styles.sliderTrack}>
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[styles.progressBarFill, animatedProgressStyle]}
            />
          </View>
          <Animated.View style={[styles.thumb, animatedThumbStyle]} />
        </View>
      </GestureDetector>

      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    marginTop: 40,
  },
  sliderTrack: {
    height: 40, // Increased touch target
    justifyContent: "center",
    position: "relative",
  },
  progressBarBg: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    width: "100%",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  thumb: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#FFF",
    left: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 0, // Adjusted since sliderTrack is taller
  },
  timeText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default ProgressBar;
