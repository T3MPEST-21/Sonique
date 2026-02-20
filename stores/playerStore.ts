import TrackPlayer, {
    AppKilledPlaybackBehavior,
    Capability,
    RepeatMode
} from "react-native-track-player";
import { create } from "zustand";
import { Track } from "./libraryStore";

interface PlayerState {
    activeTrack: Track | null;
    isPlaying: boolean; // Just a UI reflection, source of truth is TrackPlayer
    queue: Track[];
    repeatMode: RepeatMode;
    isShuffleOn: boolean;

    // Actions
    play: (track: Track, contextQueue?: Track[]) => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    next: () => Promise<void>;
    previous: () => Promise<void>;
    setQueue: (tracks: Track[]) => Promise<void>;
    toggleShuffle: () => void;
    toggleRepeat: () => void;
    setupPlayer: () => Promise<void>;
}

import { storage, StorageKeys } from '@/utils/storage';
import { createJSONStorage, persist } from 'zustand/middleware';

// Adapter for MMKV
const mmkvStorage = {
    getItem: (name: string) => storage.getString(name) || null,
    setItem: (name: string, value: string) => storage.set(name, value),
    removeItem: (name: string) => storage.remove(name),
};

export const usePlayerStore = create<PlayerState>()(
    persist(
        (set, get) => ({
            activeTrack: null,
            isPlaying: false,
            queue: [],
            repeatMode: RepeatMode.Off,
            isShuffleOn: false,

            setupPlayer: async () => {
                // Initialize the player
                try {
                    await TrackPlayer.setupPlayer();
                    await TrackPlayer.updateOptions({
                        android: {
                            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
                        },
                        capabilities: [
                            Capability.Play,
                            Capability.Pause,
                            Capability.SkipToNext,
                            Capability.SkipToPrevious,
                            Capability.SeekTo,
                        ],
                        compactCapabilities: [
                            Capability.Play,
                            Capability.Pause,
                            Capability.SkipToNext,
                        ],
                    });

                    // Restore queue to TrackPlayer if exists (from persistence)
                    const { queue, activeTrack } = get();
                    if (queue.length > 0) {
                        const trackPlayerQueue = queue.map(t => ({
                            id: t.id,
                            url: t.url,
                            title: t.title,
                            artist: t.artist,
                            duration: t.duration || 0,
                            artwork: t.artwork
                        }));
                        await TrackPlayer.add(trackPlayerQueue);

                        // If there was an active track, skip to it? 
                        // Or just let user press play. 
                        // For now we assume paused state.
                        if (activeTrack) {
                            const index = trackPlayerQueue.findIndex(t => t.id === activeTrack.id);
                            if (index !== -1) {
                                await TrackPlayer.skip(index);
                            }
                        }
                    }

                } catch (e) {
                    // Player might already be set up, ignore error
                }
            },

            play: async (track: Track, contextQueue) => {
                const currentQueue = contextQueue || [track];

                // Convert to TrackPlayer Object
                const trackPlayerQueue = currentQueue.map(t => ({
                    id: t.id,
                    url: t.url,
                    title: t.title,
                    artist: t.artist,
                    duration: t.duration || 0,
                    artwork: t.artwork
                }));

                await TrackPlayer.reset();
                await TrackPlayer.add(trackPlayerQueue);

                // Find index of the clicked track
                const index = trackPlayerQueue.findIndex(t => t.id === track.id);
                if (index !== -1) {
                    await TrackPlayer.skip(index);
                }

                await TrackPlayer.play();
                set({ activeTrack: track, isPlaying: true, queue: currentQueue });
            },

            pause: async () => {
                await TrackPlayer.pause();
                set({ isPlaying: false });
            },

            resume: async () => {
                await TrackPlayer.play();
                set({ isPlaying: true });
            },

            next: async () => {
                await TrackPlayer.skipToNext();
            },

            previous: async () => {
                await TrackPlayer.skipToPrevious();
            },

            setQueue: async (tracks) => {
                set({ queue: tracks });
                // Logic to update TrackPlayer queue in background...
            },

            toggleShuffle: () => {
                // Complex shuffle logic to be implemented
                set(state => ({ isShuffleOn: !state.isShuffleOn }));
            },

            toggleRepeat: () => {
                const nextMode = {
                    [RepeatMode.Off]: RepeatMode.Queue,
                    [RepeatMode.Queue]: RepeatMode.Track,
                    [RepeatMode.Track]: RepeatMode.Off,
                }[get().repeatMode] || RepeatMode.Off;

                TrackPlayer.setRepeatMode(nextMode);
                set({ repeatMode: nextMode });
            }
        }),
        {
            name: StorageKeys.PLAYER_STATE,
            storage: createJSONStorage(() => mmkvStorage),
            partialize: (state) => ({
                activeTrack: state.activeTrack,
                queue: state.queue,
                repeatMode: state.repeatMode,
                isShuffleOn: state.isShuffleOn,
            }),
        }
    )
);
