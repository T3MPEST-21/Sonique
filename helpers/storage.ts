import * as FileSystem from "expo-file-system/legacy";
import { Track } from "../contexts/AudioContext";

const PLAYLISTS_FILE = `${FileSystem.documentDirectory}playlists.json`;
const SETTINGS_FILE = `${FileSystem.documentDirectory}settings.json`;
const LIBRARY_FILE = `${FileSystem.documentDirectory}library_cache.json`;

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  createdAt: number;
  artworkUri?: string;
}

export const Storage = {
  // Playlists
  async savePlaylists(playlists: Playlist[]): Promise<void> {
    try {
      await FileSystem.writeAsStringAsync(
        PLAYLISTS_FILE,
        JSON.stringify(playlists),
      );
    } catch (error) {
      console.error("Error saving playlists", error);
    }
  },

  async loadPlaylists(): Promise<Playlist[]> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(PLAYLISTS_FILE);
      if (!fileInfo.exists) {
        return [];
      }
      const content = await FileSystem.readAsStringAsync(PLAYLISTS_FILE);
      return JSON.parse(content);
    } catch (error) {
      console.error("Error loading playlists", error);
      return [];
    }
  },

  // Settings
  async saveSettings(settings: any): Promise<void> {
    try {
      await FileSystem.writeAsStringAsync(
        SETTINGS_FILE,
        JSON.stringify(settings),
      );
    } catch (error) {
      console.error("Error saving settings", error);
    }
  },

  async loadSettings(): Promise<any> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(SETTINGS_FILE);
      if (!fileInfo.exists) {
        return {};
      }
      const content = await FileSystem.readAsStringAsync(SETTINGS_FILE);
      return JSON.parse(content);
    } catch (error) {
      console.error("Error loading settings", error);
      return {};
    }
  },

  // Library Cache
  async saveLibrary(tracks: Track[]): Promise<void> {
    try {
      await FileSystem.writeAsStringAsync(LIBRARY_FILE, JSON.stringify(tracks));
    } catch (error) {
      console.error("Error saving library cache", error);
    }
  },

  async loadLibrary(): Promise<Track[]> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(LIBRARY_FILE);
      if (!fileInfo.exists) {
        return [];
      }
      const content = await FileSystem.readAsStringAsync(LIBRARY_FILE);
      return JSON.parse(content);
    } catch (error) {
      console.error("Error loading library cache", error);
      return [];
    }
  },
};
