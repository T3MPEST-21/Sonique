import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    Modal,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../constants/theme";
import { useAudio } from "../contexts/AudioContext";

const { height } = Dimensions.get("window");

interface SleepTimerViewProps {
  visible: boolean;
  onClose: () => void;
}

const SleepTimerView: React.FC<SleepTimerViewProps> = ({
  visible,
  onClose,
}) => {
  const {
    sleepTimerEnd,
    setSleepTimer,
    cancelSleepTimer,
    stopAtEndOfTrack,
    setStopAtEndOfTrack,
  } = useAudio();

  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    if (!sleepTimerEnd) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = sleepTimerEnd - now;
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}:${secs < 10 ? "0" : ""}${secs}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [sleepTimerEnd]);

  const presets = [15, 30, 45, 60];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Sleep Timer</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {timeLeft && (
            <View style={styles.activeTimerInfo}>
              <Text style={styles.activeTimerLabel}>Timer running:</Text>
              <Text style={styles.activeTimerValue}>{timeLeft}</Text>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => cancelSleepTimer()}
              >
                <Text style={styles.cancelButtonText}>Cancel Timer</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.presetsContainer}>
            <Text style={styles.sectionTitle}>Stop in:</Text>
            <View style={styles.presetsGrid}>
              {presets.map((mins) => (
                <TouchableOpacity
                  key={mins}
                  style={styles.presetButton}
                  onPress={() => {
                    setSleepTimer(mins);
                    onClose();
                  }}
                >
                  <Text style={styles.presetText}>{mins} min</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.toggleContainer}>
            <View>
              <Text style={styles.sectionTitle}>Stop after track</Text>
              <Text style={styles.toggleSubtitle}>
                Stop playback when the current song finishes
              </Text>
            </View>
            <Switch
              value={stopAtEndOfTrack}
              onValueChange={setStopAtEndOfTrack}
              trackColor={{ false: "#333", true: COLORS.primary }}
              thumbColor={stopAtEndOfTrack ? "#FFF" : "#f4f3f4"}
            />
          </View>
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
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  content: {
    backgroundColor: "#161622",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  activeTimerInfo: {
    backgroundColor: "rgba(108, 99, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(108, 99, 255, 0.2)",
  },
  activeTimerLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    marginBottom: 4,
  },
  activeTimerValue: {
    color: COLORS.primary,
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  cancelButtonText: {
    color: "#FF5252",
    fontSize: 14,
    fontWeight: "600",
  },
  sectionTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  presetsContainer: {
    marginBottom: 24,
  },
  presetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  presetButton: {
    flex: 1,
    minWidth: "45%",
    height: 50,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
  },
  presetText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "500",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 16,
    borderRadius: 16,
  },
  toggleSubtitle: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    marginTop: 2,
  },
});

export default SleepTimerView;
