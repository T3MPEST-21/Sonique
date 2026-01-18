import * as FileSystem from "expo-file-system/legacy";
import { Track } from "../contexts/AudioContext";

const STATE_FILE = FileSystem.documentDirectory + "audio_state.json";

export interface AudioState {
  currentTrack: Track | null;
  queue: Track[];
  originalQueue: Track[];
  isShuffle: boolean;
  loopMode: "none" | "all" | "one";
  lastSaved: number;
}

export const saveAudioState = async (state: AudioState) => {
  try {
    const jsonString = JSON.stringify(state);
    await FileSystem.writeAsStringAsync(STATE_FILE, jsonString);
  } catch (error) {
    console.error("Error saving audio state:", error);
  }
};

export const loadAudioState = async (): Promise<AudioState | null> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(STATE_FILE);
    if (!fileInfo.exists) return null;

    const jsonString = await FileSystem.readAsStringAsync(STATE_FILE);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error loading audio state:", error);
    return null;
  }
};

export const clearAudioState = async () => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(STATE_FILE);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(STATE_FILE);
    }
  } catch (error) {
    console.error("Error clearing audio state:", error);
  }
};
