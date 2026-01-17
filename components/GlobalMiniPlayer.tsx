import { COLORS } from "@/constants/theme";
import { useAudio } from "@/contexts/AudioContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const GlobalMiniPlayer = () => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    currentTrack,
    isPlaying,
    pauseTrack,
    resumeTrack,
    position,
    duration,
  } = useAudio();

  // Hide miniplayer on splash screen and player modal
  const hideOnPaths = ["/", "/PlayerModal"];
  if (hideOnPaths.includes(pathname) || !currentTrack) {
    return null;
  }

  // Check if we are in tabs to adjust bottom position
  const isInTabs = pathname.includes("(tabs)");

  return (
    <TouchableOpacity
      style={[styles.container, { bottom: isInTabs ? 70 : 20 }]}
      activeOpacity={0.9}
      onPress={() => router.push("/PlayerModal")}
    >
      {/* Progress Line */}
      <View style={styles.progressBar}>
        <View
          style={{
            width: `${duration > 0 ? (position / duration) * 100 : 0}%`,
            height: "100%",
            backgroundColor: COLORS.primary,
          }}
        />
      </View>

      <View style={styles.playerContent}>
        <View style={styles.miniArtContainer}>
          {currentTrack.artwork ? (
            <Image
              source={{ uri: currentTrack.artwork }}
              style={styles.miniArt}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.miniArt, styles.placeholderArt]}>
              <Ionicons
                name="musical-note"
                size={20}
                color="rgba(255,255,255,0.3)"
              />
            </View>
          )}
        </View>

        <View style={styles.miniInfo}>
          <Text style={styles.miniTitle} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.miniArtist} numberOfLines={1}>
            {currentTrack.artist || "Unknown Artist"}
          </Text>
        </View>

        <View style={styles.miniControls}>
          <TouchableOpacity
            onPress={() => (isPlaying ? pauseTrack() : resumeTrack())}
            style={styles.playButton}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={22}
              color="#FFF"
              style={!isPlaying && { marginLeft: 2 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 15,
    right: 15,
    backgroundColor: "#1E1E2E",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 1000,
  },
  progressBar: {
    height: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
    width: "100%",
  },
  playerContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  miniArtContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    overflow: "hidden",
  },
  miniArt: {
    width: "100%",
    height: "100%",
  },
  placeholderArt: {
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  miniInfo: {
    flex: 1,
    marginLeft: 12,
  },
  miniTitle: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
  miniArtist: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
  },
  miniControls: {
    paddingHorizontal: 10,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default GlobalMiniPlayer;
