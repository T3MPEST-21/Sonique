import TrackPlayer, {
    AppKilledPlaybackBehavior,
    Capability,
    Event,
    RepeatMode,
    State
} from "react-native-track-player";
import { create } from "zustand";
import { Track } from "./libraryStore";
import { useThemeStore } from "./themeStore";

interface PlayerState {
    activeTrack: Track | null;
    isPlaying: boolean; // UI reflection — source of truth is TrackPlayer
    queue: Track[];
    repeatMode: RepeatMode;
    isShuffleOn: boolean;
    sleepTimerEndsAt: number | null;
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
    stop: () => Promise<void>;
    setSleepTimer: (minutes: number | null) => void;
}

import { storage, StorageKeys } from '@/utils/storage';
import { createJSONStorage, persist } from 'zustand/middleware';

// Adapter for MMKV
const mmkvStorage = {
    getItem: (name: string) => storage.getString(name) || null,
    setItem: (name: string, value: string) => storage.set(name, value),
    removeItem: (name: string) => storage.remove(name),
};

let sleepTimeout: any = null;
let isCrossfadingOut = false;
let isCrossfadingIn = false;
let crossfadeSessionId = 0;

export const usePlayerStore = create<PlayerState>()(
    persist(
        (set, get) => ({
            activeTrack: null,
            isPlaying: false,
            queue: [],
            repeatMode: RepeatMode.Off,
            isShuffleOn: false,
            sleepTimerEndsAt: null,

            setupPlayer: async () => {
                // Initialize the player
                try {
                    await TrackPlayer.setupPlayer();
                    await TrackPlayer.updateOptions({
                        android: {
                            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
                        },
                        capabilities: [
                            Capability.Play,
                            Capability.Pause,
                            Capability.SkipToNext,
                            Capability.SkipToPrevious,
                            Capability.SeekTo,
                            Capability.Stop,
                        ],
                        compactCapabilities: [
                            Capability.Play,
                            Capability.Pause,
                            Capability.SkipToNext,
                            Capability.SkipToPrevious,
                            Capability.Stop,
                        ],
                    });

                    // Add central listeners
                    TrackPlayer.addEventListener(Event.PlaybackState, ({ state }) => {
                        set({ isPlaying: state === State.Playing });
                    });

                    TrackPlayer.addEventListener(Event.PlaybackTrackChanged, async () => {
                        isCrossfadingOut = false;
                        const currentSession = ++crossfadeSessionId;

                        // If we are crossfading in, handle volume ramp-up
                        const { crossfadeEnabled, crossfadeDuration } = useThemeStore.getState();
                        if (crossfadeEnabled && crossfadeDuration > 0 && isCrossfadingIn) {
                            await TrackPlayer.setVolume(0);
                            const steps = 10;
                            const stepMs = (crossfadeDuration * 500) / steps; // Fade in over half the time
                            const volumeStep = 1 / steps;

                            for (let i = 1; i <= steps; i++) {
                                setTimeout(async () => {
                                    if (currentSession !== crossfadeSessionId) return;
                                    await TrackPlayer.setVolume(Math.min(1, volumeStep * i));
                                    if (i === steps) isCrossfadingIn = false;
                                }, stepMs * i);
                            }
                        } else {
                            isCrossfadingIn = false; // Manual skip resets crossfade state
                            await TrackPlayer.setVolume(1);
                        }

                        const index = await TrackPlayer.getActiveTrackIndex();
                        if (index !== undefined && index !== null) {
                            const track = await TrackPlayer.getTrack(index);
                            if (track) set({ activeTrack: track as any });
                        }
                    });

                    // Crossfade: fade out near end, skip, fade back in
                    TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, async ({ position, duration }) => {
                        if (isCrossfadingOut || isCrossfadingIn || duration <= 0) return;
                        const { crossfadeEnabled, crossfadeDuration } = useThemeStore.getState();
                        if (!crossfadeEnabled || crossfadeDuration <= 0) return;
                        if (get().repeatMode === RepeatMode.Track) return;

                        const remaining = duration - position;
                        if (remaining > crossfadeDuration || remaining <= 1) return; // Don't start if too close to end either

                        isCrossfadingOut = true;
                        isCrossfadingIn = true; // Signal the next track to fade in
                        const currentSession = crossfadeSessionId;

                        const steps = 10;
                        const fadeDurationMs = crossfadeDuration * 1000;
                        const stepMs = fadeDurationMs / steps;
                        const volumeStep = 1 / steps;

                        // Start fade out
                        for (let i = 1; i <= steps; i++) {
                            setTimeout(async () => {
                                if (currentSession !== crossfadeSessionId) return;
                                await TrackPlayer.setVolume(Math.max(0, 1 - volumeStep * i));
                            }, stepMs * i);
                        }

                        // Skip at the midpoint
                        setTimeout(async () => {
                            if (currentSession !== crossfadeSessionId) return;
                            await TrackPlayer.skipToNext();
                        }, fadeDurationMs / 2);
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

                        if (activeTrack) {
                            const index = trackPlayerQueue.findIndex(t => t.id === activeTrack.id);
                            if (index !== -1) {
                                await TrackPlayer.skip(index);
                            }
                        }
                    }

                    // Check for existing sleep timer
                    const { sleepTimerEndsAt, setSleepTimer } = get();
                    if (sleepTimerEndsAt) {
                        const now = Date.now();
                        const diff = sleepTimerEndsAt - now;
                        if (diff > 0) {
                            setSleepTimer(diff / 60000);
                        } else {
                            set({ sleepTimerEndsAt: null });
                        }
                    }

                } catch (e) {
                    // Player already setup
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
            },

            stop: async () => {
                await TrackPlayer.reset();
                set({ activeTrack: null, isPlaying: false, queue: [] });
            },

            setSleepTimer: (minutes) => {
                if (sleepTimeout) {
                    clearTimeout(sleepTimeout);
                    sleepTimeout = null;
                }

                if (minutes === null) {
                    set({ sleepTimerEndsAt: null });
                    return;
                }

                const endsAt = Date.now() + minutes * 60 * 1000;
                set({ sleepTimerEndsAt: endsAt });

                sleepTimeout = setTimeout(async () => {
                    await TrackPlayer.pause();
                    set({ isPlaying: false, sleepTimerEndsAt: null });
                    sleepTimeout = null;
                }, minutes * 60 * 1000);
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
                sleepTimerEndsAt: state.sleepTimerEndsAt,
            }),
            // Never persist isPlaying; always start paused after restart
        }
    )
);
