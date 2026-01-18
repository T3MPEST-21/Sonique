import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from "expo-audio";
import * as MediaLibrary from "expo-media-library";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Alert } from "react-native";
import { Playlist, Storage } from "../helpers/storage";
import { loadAudioState, saveAudioState } from "../utils/persistence";

// Define the shape of a Track
export interface Track {
  id: string;
  title: string;
  artist: string;
  uri: string;
  artwork?: string;
  duration: number;
  mood?: string;
  creationTime?: number;
  size?: number;
}

export interface PlaybackSource {
  type: "library" | "playlist" | "mood";
  id?: string;
}

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  playTrack: (
    track: Track,
    newQueue?: Track[],
    forcePlay?: boolean,
    source?: PlaybackSource,
  ) => Promise<void>;
  playbackSource: PlaybackSource | null;
  reorderPlaylistTrack: (
    playlistId: string,
    fromIndex: number,
    toIndex: number,
  ) => Promise<void>;
  pauseTrack: () => void;
  resumeTrack: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  loadLocalMusic: () => Promise<Track[]>;
  player: AudioPlayer | null;
  position: number;
  duration: number;
  activeMood: string;
  setActiveMood: (mood: string) => void;
  playlists: Playlist[];
  createPlaylist: (name: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeTrackFromPlaylist: (
    playlistId: string,
    trackId: string,
  ) => Promise<void>;
  renamePlaylist: (playlistId: string, newName: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  updatePlaylistArtwork: (
    playlistId: string,
    artworkUri: string,
  ) => Promise<void>;
  reloadLibrary: () => Promise<void>;
  allTracks: Track[];
  stopPlayback: () => void;
  isShuffle: boolean;
  loopMode: "none" | "all" | "one";
  toggleShuffle: () => void;
  toggleLoopMode: () => void;
  queue: Track[];
  removeFromQueue: (trackId: string) => void;
  moveQueueItem: (fromIndex: number, toIndex: number) => void;
  seek: (millis: number) => void;
  sleepTimerEnd: number | null;
  setSleepTimer: (minutes: number) => void;
  cancelSleepTimer: () => void;
  stopAtEndOfTrack: boolean;
  setStopAtEndOfTrack: (value: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [player, setPlayer] = useState<AudioPlayer | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeMood, setActiveMood] = useState("All Moods");
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [loopMode, setLoopMode] = useState<"none" | "all" | "one">("none");
  const [originalQueue, setOriginalQueue] = useState<Track[]>([]);
  const [sleepTimerEnd, setSleepTimerEnd] = useState<number | null>(null);
  const [stopAtEndOfTrack, setStopAtEndOfTrack] = useState(false);
  const [playbackSource, setPlaybackSource] = useState<PlaybackSource | null>(
    null,
  );

  // Setup Audio Mode and Load Data on mount
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await setAudioModeAsync({
          shouldPlayInBackground: true,
          playsInSilentMode: true,
          interruptionMode: "doNotMix",
        });

        // Load cached playlists
        const savedPlaylists = await Storage.loadPlaylists();
        setPlaylists(savedPlaylists);

        // Load cached library immediately for "instant-on" feel
        const cachedTracks = await Storage.loadLibrary();
        if (cachedTracks.length > 0) {
          setAllTracks(cachedTracks);
        }

        // Refresh in background
        reloadLibrary();

        // Load persistent audio state
        const savedState = await loadAudioState();
        if (savedState && savedState.currentTrack) {
          setQueue(savedState.queue);
          setOriginalQueue(savedState.originalQueue);
          setIsShuffle(savedState.isShuffle);
          setLoopMode(savedState.loopMode);

          const restoredTrack = savedState.currentTrack;
          setCurrentTrack(restoredTrack);

          const currentPlayer = createAudioPlayer(restoredTrack.uri, {
            updateInterval: 500,
          });
          setPlayer(currentPlayer);
          setupPlayerListeners(currentPlayer, restoredTrack);
        }
      } catch (error) {
        console.error("Error setting up audio mode or loading data", error);
      }
    };
    setupAudio();
  }, []);

  // Sleep Timer logic
  useEffect(() => {
    if (!sleepTimerEnd) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= sleepTimerEnd) {
        stopPlayback();
        setSleepTimerEnd(null);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerEnd]);

  // Save state whenever it changes
  useEffect(() => {
    saveAudioState({
      currentTrack,
      queue,
      originalQueue,
      isShuffle,
      loopMode,
      lastSaved: Date.now(),
    });
  }, [currentTrack, queue, originalQueue, isShuffle, loopMode]);

  // Cleanup player on unmount
  useEffect(() => {
    return () => {
      if (player) {
        player.remove();
      }
    };
  }, [player]);

  const setupPlayerListeners = (playerInstance: AudioPlayer, track: Track) => {
    // Set lock screen info - wrap in safety check
    if (typeof playerInstance.setActiveForLockScreen === "function") {
      playerInstance.setActiveForLockScreen(
        true,
        {
          title: track.title,
          artist: track.artist || "Sonique Artist",
          albumTitle: "Sonique",
          artworkUrl: track.artwork,
        },
        {
          showSeekForward: true,
          showSeekBackward: true,
        },
      );
    }

    // Listen to playback updates
    playerInstance.addListener("playbackStatusUpdate", (status) => {
      setPosition(status.currentTime * 1000);
      setDuration(status.duration * 1000);
      setIsPlaying(status.playing);

      if (status.didJustFinish) {
        // Use a small timeout to avoid potential race conditions with state updates
        setTimeout(() => handleTrackEnd(), 100);
      }
    });
  };

  const playTrack = async (
    track: Track,
    newQueue?: Track[],
    forcePlay: boolean = false,
    source?: PlaybackSource,
  ) => {
    try {
      if (source) setPlaybackSource(source);
      else if (newQueue) setPlaybackSource({ type: "library" });

      let finalQueue = newQueue || (queue.length > 0 ? queue : [track]);

      if (newQueue) {
        setOriginalQueue(newQueue);
        if (isShuffle) {
          // Shuffle the new queue but keep the selected track first
          const others = newQueue.filter((t) => t.id !== track.id);
          const shuffled = [...others].sort(() => Math.random() - 0.5);
          finalQueue = [track, ...shuffled];
        } else {
          finalQueue = newQueue;
        }
        setQueue(finalQueue);
      }

      if (!forcePlay && currentTrack?.id === track.id && player) {
        if (isPlaying) {
          pauseTrack();
        } else {
          resumeTrack();
        }
        return;
      }

      // Create or replace player
      let currentPlayer = player;
      if (!currentPlayer) {
        currentPlayer = createAudioPlayer(track.uri, { updateInterval: 500 });
        setPlayer(currentPlayer);
      } else {
        currentPlayer.replace(track.uri);
      }

      setCurrentTrack(track);
      setIsPlaying(true);
      currentPlayer.play();

      setupPlayerListeners(currentPlayer, track);
    } catch (error) {
      console.error("Error playing audio", error);
    }
  };

  const handleTrackEnd = () => {
    if (loopMode === "one" && player) {
      player.seekTo(0);
      player.play();
      setIsPlaying(true);
      return;
    }
    nextTrack();
  };

  const pauseTrack = () => {
    if (player) {
      player.pause();
      setIsPlaying(false);
    }
  };

  const resumeTrack = () => {
    if (player) {
      player.play();
      setIsPlaying(true);
    }
  };

  const nextTrack = () => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    let nextIndex = currentIndex + 1;

    if (nextIndex >= queue.length) {
      if (loopMode === "all") {
        nextIndex = 0;
      } else {
        // Stop playback if we're at the end and not looping all
        stopPlayback();
        return;
      }
    }

    if (stopAtEndOfTrack) {
      stopPlayback();
      setStopAtEndOfTrack(false);
      return;
    }

    playTrack(queue[nextIndex], undefined, true);
  };

  const previousTrack = () => {
    if (queue.length === 0 || !player) return;

    // Standard behavior: if position > 3s, restart current track
    if (position > 3000) {
      player.seekTo(0);
      player.play();
      setIsPlaying(true);
      return;
    }

    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      if (loopMode === "all") {
        prevIndex = queue.length - 1;
      } else {
        // Just restart the first song if not looping all
        player.seekTo(0);
        player.play();
        setIsPlaying(true);
        return;
      }
    }
    playTrack(queue[prevIndex], undefined, true);
  };

  const stopPlayback = () => {
    if (player) {
      player.pause();
      if (typeof player.clearLockScreenControls === "function") {
        player.clearLockScreenControls();
      }
    }
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  const toggleShuffle = () => {
    const newShuffle = !isShuffle;
    setIsShuffle(newShuffle);

    if (newShuffle) {
      // Shuffle the current queue, keeping current track first
      const others = queue.filter((t) => t.id !== currentTrack?.id);
      const shuffled = [...others].sort(() => Math.random() - 0.5);
      setQueue(currentTrack ? [currentTrack, ...shuffled] : shuffled);
    } else {
      // Restore from original queue
      setQueue(originalQueue);
    }
  };

  const toggleLoopMode = () => {
    const modes: ("none" | "all" | "one")[] = ["none", "all", "one"];
    const currentIndex = modes.indexOf(loopMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setLoopMode(modes[nextIndex]);
  };

  const removeFromQueue = (trackId: string) => {
    setQueue((prev) => prev.filter((t) => t.id !== trackId));
    setOriginalQueue((prev) => prev.filter((t) => t.id !== trackId));
  };

  const moveQueueItem = (fromIndex: number, toIndex: number) => {
    setQueue((prev) => {
      const newQueue = [...prev];
      const [removed] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, removed);
      return newQueue;
    });

    // If not shuffling, also update the master original queue
    if (!isShuffle) {
      setOriginalQueue((prev) => {
        const newQueue = [...prev];
        const [removed] = newQueue.splice(fromIndex, 1);
        newQueue.splice(toIndex, 0, removed);
        return newQueue;
      });
    }
  };

  const reorderPlaylistTrack = async (
    playlistId: string,
    fromIndex: number,
    toIndex: number,
  ) => {
    const updatedPlaylists = playlists.map((p) => {
      if (p.id === playlistId) {
        const newTracks = [...p.tracks];
        const [moved] = newTracks.splice(fromIndex, 1);
        newTracks.splice(toIndex, 0, moved);
        return { ...p, tracks: newTracks };
      }
      return p;
    });

    setPlaylists(updatedPlaylists);
    await Storage.savePlaylists(updatedPlaylists);
  };

  const setSleepTimer = (minutes: number) => {
    if (minutes === 0) {
      setSleepTimerEnd(null);
    } else {
      setSleepTimerEnd(Date.now() + minutes * 60 * 1000);
    }
  };

  const cancelSleepTimer = () => {
    setSleepTimerEnd(null);
  };

  const seek = (millis: number) => {
    if (player) {
      player.seekTo(millis / 1000);
      setPosition(millis);
    }
  };

  const getMoodForTrack = (filename: string): string => {
    const name = filename.toLowerCase();
    if (
      name.includes("chill") ||
      name.includes("relax") ||
      name.includes("ambient") ||
      name.includes("space")
    )
      return "Calm";
    if (
      name.includes("run") ||
      name.includes("workout") ||
      name.includes("gym") ||
      name.includes("fast") ||
      name.includes("gym")
    )
      return "Workout";
    if (
      name.includes("party") ||
      name.includes("dance") ||
      name.includes("energy") ||
      name.includes("upbeat")
    )
      return "Energetic";
    if (
      name.includes("sad") ||
      name.includes("cry") ||
      name.includes("blue") ||
      name.includes("night") ||
      name.includes("midnight")
    )
      return "Melancholic";
    if (
      name.includes("study") ||
      name.includes("focus") ||
      name.includes("deep") ||
      name.includes("work")
    )
      return "Focus";

    // Randomly assign a mood if no keywords found for "spirit" variety,
    // or default to "Calm" for local testing if preferred.
    const moods = ["Calm", "Energetic", "Melancholic", "Focus", "Workout"];
    return moods[Math.floor(Math.random() * moods.length)];
  };

  const loadLocalMusic = async (): Promise<Track[]> => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant permission to access your audio files",
      );
      return [];
    }

    let allAssets: MediaLibrary.Asset[] = [];
    let hasNextPage = true;
    let endCursor: string | undefined = undefined;

    while (hasNextPage) {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: "audio",
        first: 100,
        after: endCursor,
      });
      allAssets = [...allAssets, ...media.assets];
      hasNextPage = media.hasNextPage;
      endCursor = media.endCursor;
    }

    return allAssets.map((asset) => ({
      id: asset.id,
      title: asset.filename.replace(/\.[^/.]+$/, ""),
      artist: "Unknown Artist",
      uri: asset.uri,
      duration: asset.duration * 1000,
      artwork: undefined,
      mood: getMoodForTrack(asset.filename),
      creationTime: asset.creationTime,
      // size will be fetched using a helper if needed or we can fetch a few info
      // but Asset itself doesn't have it.
    }));
  };

  const reloadLibrary = async () => {
    const tracks = await loadLocalMusic();
    setAllTracks(tracks);
    await Storage.saveLibrary(tracks);
  };

  const updatePlaylistArtwork = async (
    playlistId: string,
    artworkUri: string,
  ) => {
    const updatedPlaylists = playlists.map((p) => {
      if (p.id === playlistId) {
        return { ...p, artworkUri };
      }
      return p;
    });
    setPlaylists(updatedPlaylists);
    await Storage.savePlaylists(updatedPlaylists);
  };
  const createPlaylist = async (name: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      tracks: [],
      createdAt: Date.now(),
    };
    const updated = [...playlists, newPlaylist];
    setPlaylists(updated);
    await Storage.savePlaylists(updated);
  };

  const addTrackToPlaylist = async (playlistId: string, track: Track) => {
    const updatedPlaylists = playlists.map((p) => {
      if (p.id === playlistId) {
        // Prevent duplicates
        if (p.tracks.find((t) => t.id === track.id)) return p;
        return { ...p, tracks: [...p.tracks, track] };
      }
      return p;
    });
    setPlaylists(updatedPlaylists);
    await Storage.savePlaylists(updatedPlaylists);
  };

  const removeTrackFromPlaylist = async (
    playlistId: string,
    trackId: string,
  ) => {
    const updatedPlaylists = playlists.map((p) => {
      if (p.id === playlistId) {
        return { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) };
      }
      return p;
    });
    setPlaylists(updatedPlaylists);
    await Storage.savePlaylists(updatedPlaylists);
  };

  const renamePlaylist = async (playlistId: string, newName: string) => {
    const updatedPlaylists = playlists.map((p) => {
      if (p.id === playlistId) {
        return { ...p, name: newName };
      }
      return p;
    });
    setPlaylists(updatedPlaylists);
    await Storage.savePlaylists(updatedPlaylists);
  };

  const deletePlaylist = async (playlistId: string) => {
    const updated = playlists.filter((p) => p.id !== playlistId);
    setPlaylists(updated);
    await Storage.savePlaylists(updated);
  };

  const value = useMemo(
    () => ({
      currentTrack,
      isPlaying,
      playTrack,
      pauseTrack,
      resumeTrack,
      nextTrack,
      previousTrack,
      loadLocalMusic,
      player,
      position,
      duration,
      activeMood,
      setActiveMood,
      playlists,
      createPlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
      renamePlaylist,
      deletePlaylist,
      updatePlaylistArtwork,
      reloadLibrary,
      allTracks,
      stopPlayback,
      isShuffle,
      loopMode,
      toggleShuffle,
      toggleLoopMode,
      queue,
      removeFromQueue,
      moveQueueItem,
      playbackSource,
      reorderPlaylistTrack,
      seek,
      sleepTimerEnd,
      setSleepTimer,
      cancelSleepTimer,
      stopAtEndOfTrack,
      setStopAtEndOfTrack,
    }),
    [
      currentTrack,
      isPlaying,
      position,
      duration,
      activeMood,
      playlists,
      allTracks,
      player,
      isShuffle,
      loopMode,
      queue,
      playbackSource,
      sleepTimerEnd,
      stopAtEndOfTrack,
    ],
  );

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
