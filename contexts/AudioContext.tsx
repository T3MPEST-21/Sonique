import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export interface Track {
    id: string;
    title: string;
    artist: string;
    uri: string;
    artwork?: string;
    duration: number;
    modificationTime?: number;
    size?: number;
    albumId?: string;
    albumName?: string;
}

export interface Playlist {
    id: string;
    name: string;
    tracks: Track[];
    createdAt: number;
}

export type RepeatMode = 'OFF' | 'ALL' | 'ONE';

interface AudioContextType {
    currentTrack: Track | null;
    isPlaying: boolean;
    playTrack: (track: Track, playlistContext?: Track[]) => Promise<void>;
    enqueueNext: (track: Track) => void;
    pauseTrack: () => Promise<void>;
    resumeTrack: () => Promise<void>;
    stopPlayback: () => Promise<void>;
    playNext: () => Promise<void>;
    playPrev: () => Promise<void>;
    seek: (position: number) => Promise<void>;

    // Data
    playlist: Track[]; // The current queue (could be library or a specific playlist)
    libraryTracks: Track[]; // All local songs
    customPlaylists: Playlist[];
    loadLocalMusic: () => Promise<void>;

    // Modes
    shuffleOn: boolean;
    repeatMode: RepeatMode;
    toggleShuffle: () => void;
    toggleRepeat: () => void;

    // Playlist Management
    createPlaylist: (name: string) => Promise<void>;
    deletePlaylist: (id: string) => Promise<void>;
    addToPlaylist: (playlistId: string, track: Track) => Promise<void>;
    addTracksToPlaylist: (playlistId: string, tracks: Track[]) => Promise<void>;
    moveTracksToPlaylist: (sourceId: string, targetId: string, trackIds: string[]) => Promise<void>;
    removeFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;

    // Queue Manipulation
    removeFromQueue: (trackId: string) => void;
    clearQueue: () => void;

    // Metadata & Moods
    trackOverrides: Record<string, any>;
    updateTrackMetadata: (trackId: string, changes: any) => Promise<void>;

    sound: Audio.Sound | null;
    position: number;
    duration: number;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Queues
    const [currentQueue, setCurrentQueue] = useState<Track[]>([]);
    const [libraryTracks, setLibraryTracks] = useState<Track[]>([]); // All local songs
    const [customPlaylists, setCustomPlaylists] = useState<Playlist[]>([]);

    // State
    const [shuffleOn, setShuffleOn] = useState(false);
    const [repeatMode, setRepeatMode] = useState<RepeatMode>('OFF'); // OFF -> ALL -> ONE -> OFF
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);

    const [trackOverrides, setTrackOverrides] = useState<Record<string, any>>({});

    // Persist Playlists & Overrides
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const storedPlaylists = await AsyncStorage.getItem('customPlaylists');
            if (storedPlaylists) {
                const parsed = JSON.parse(storedPlaylists);
                // Basic validation: ensure it's an array
                if (Array.isArray(parsed)) {
                    setCustomPlaylists(parsed);
                }
            }

            const storedOverrides = await AsyncStorage.getItem('trackOverrides');
            if (storedOverrides) {
                const parsed = JSON.parse(storedOverrides);
                // Validation: ensure it's an object
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    setTrackOverrides(parsed);
                }
            }
        } catch (e) {
            console.error("Failed to load data", e);
        }
    };

    const savePlaylists = async (playlists: Playlist[]) => {
        setCustomPlaylists(playlists);
        await AsyncStorage.setItem('customPlaylists', JSON.stringify(playlists));
    };

    const updateTrackMetadata = async (trackId: string, changes: any) => {
        const newOverrides = {
            ...trackOverrides,
            [trackId]: {
                ...(trackOverrides[trackId] || {}),
                ...changes
            }
        };
        setTrackOverrides(newOverrides);
        await AsyncStorage.setItem('trackOverrides', JSON.stringify(newOverrides));
    };

    // Setup Audio Mode
    useEffect(() => {
        Audio.setAudioModeAsync({
            staysActiveInBackground: true,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: false,
            playThroughEarpieceAndroid: false,
            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        });
    }, []);

    // Cleanup sound on unmount
    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);


    // Next/Prev Logic
    const getNextTrackIndex = () => {
        if (currentQueue.length === 0 || !currentTrack) return -1;
        const currentIndex = currentQueue.findIndex(t => t.id === currentTrack.id);

        if (shuffleOn) {
            // Simple random for now, ideally use a shuffled queue approach
            let nextIndex = Math.floor(Math.random() * currentQueue.length);
            while (nextIndex === currentIndex && currentQueue.length > 1) {
                nextIndex = Math.floor(Math.random() * currentQueue.length);
            }
            return nextIndex;
        }

        const nextIndex = currentIndex + 1;
        if (nextIndex >= currentQueue.length) {
            return repeatMode === 'ALL' ? 0 : -1; // -1 means stop
        }
        return nextIndex;
    };

    const playNext = async () => {
        const nextIndex = getNextTrackIndex();
        if (nextIndex !== -1) {
            await playTrack(currentQueue[nextIndex]);
        } else {
            // Stop
            if (sound) await sound.stopAsync();
            setIsPlaying(false);
            setPosition(0);
        }
    };

    const playPrev = async () => {
        if (currentQueue.length === 0 || !currentTrack) return;

        // If seek > 3 sec, restart song
        if (position > 3000) { // 3 seconds
            if (sound) await sound.setPositionAsync(0);
            return;
        }

        const currentIndex = currentQueue.findIndex(t => t.id === currentTrack.id);
        const prevIndex = currentIndex - 1;

        if (prevIndex < 0) {
            // Wrap around or stop? Usually prev on first track goes to last track if repeat all
            if (repeatMode === 'ALL') {
                await playTrack(currentQueue[currentQueue.length - 1]);
            } else {
                // Restart
                if (sound) await sound.setPositionAsync(0);
            }
        } else {
            await playTrack(currentQueue[prevIndex]);
        }
    };

    const onPlaybackStatusUpdate = async (status: any) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis || 0);
            setIsPlaying(status.isPlaying);

            if (status.didJustFinish) {
                if (repeatMode === 'ONE') {
                    if (sound) await sound.replayAsync();
                } else {
                    await playNext();
                }
            }
        }
    };

    const loadLocalMusic = async () => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant permission to access your audio files');
            return;
        }

        const media = await MediaLibrary.getAssetsAsync({
            mediaType: 'audio',
            first: 5000,
            sortBy: [MediaLibrary.SortBy.modificationTime],
        });

        // Fetch albums to map names
        const albums = await MediaLibrary.getAlbumsAsync();
        const albumMap: Record<string, string> = {};
        albums.forEach(a => albumMap[a.id] = a.title);

        const tracks = media.assets.map((asset) => ({
            id: asset.id,
            title: asset.filename.replace(/\.[^/.]+$/, ""),
            artist: 'Unknown Artist',
            uri: asset.uri,
            duration: asset.duration,
            modificationTime: asset.modificationTime,
            albumId: (asset as any).albumId,
            albumName: albumMap[(asset as any).albumId] || 'Local Audio',
            size: 0,
        }));

        setLibraryTracks(tracks);
        // Initially, the queue is the library
        if (currentQueue.length === 0) {
            setCurrentQueue(tracks);
        }

        // Cleanup stale overrides (orphans)
        cleanupStaleOverrides(tracks);
    };

    const cleanupStaleOverrides = async (currentTracks: Track[]) => {
        const trackIds = new Set(currentTracks.map(t => t.id));
        const staleIds = Object.keys(trackOverrides).filter(id => !trackIds.has(id));

        if (staleIds.length > 0) {
            const newOverrides = { ...trackOverrides };
            staleIds.forEach(id => delete newOverrides[id]);
            setTrackOverrides(newOverrides);
            await AsyncStorage.setItem('trackOverrides', JSON.stringify(newOverrides));
            console.log(`Cleaned up ${staleIds.length} orphaned metadata entries.`);
        }
    };

    const playTrack = async (track: Track, newQueue?: Track[]) => {
        try {
            // If new context provided (e.g., clicking play on a playlist), update queue
            if (newQueue) {
                setCurrentQueue(newQueue);
            } else if (!currentQueue.some(t => t.id === track.id)) {
                // If track not in current queue, playing from library context? 
                // For now, assume if playing from list, that list IS the queue.
                // But if we just pass track, finding it in library is safest fallback
            }

            if (currentTrack?.id === track.id && sound) {
                if (isPlaying) await pauseTrack();
                else await resumeTrack();
                return;
            }

            if (sound) {
                await sound.unloadAsync();
            }

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: track.uri },
                { shouldPlay: true },
                onPlaybackStatusUpdate
            );

            setSound(newSound);
            setCurrentTrack(track);
            setIsPlaying(true);

        } catch (error) {
            console.error("Error playing audio", error);
            Alert.alert("Error", "Could not play this track.");
        }
    };

    const pauseTrack = async () => {
        if (sound) {
            await sound.pauseAsync();
            setIsPlaying(false);
        }
    };

    const resumeTrack = async () => {
        if (sound) {
            await sound.playAsync();
            setIsPlaying(true);
        }
    };

    const seek = async (pos: number) => {
        if (sound) {
            await sound.setPositionAsync(pos);
        }
    };

    const toggleShuffle = () => setShuffleOn(prev => !prev);

    const toggleRepeat = () => {
        setRepeatMode(prev => {
            if (prev === 'OFF') return 'ALL';
            if (prev === 'ALL') return 'ONE';
            return 'OFF';
        });
    };

    // --- Playlist Management ---

    const createPlaylist = async (name: string) => {
        const newPlaylist: Playlist = {
            id: Date.now().toString(),
            name,
            tracks: [],
            createdAt: Date.now(),
        };
        await savePlaylists([...customPlaylists, newPlaylist]);
    };

    const deletePlaylist = async (id: string) => {
        const updated = customPlaylists.filter(p => p.id !== id);
        await savePlaylists(updated);
    };

    const addTracksToPlaylist = async (playlistId: string, tracks: Track[]) => {
        const updated = customPlaylists.map(p => {
            if (p.id === playlistId) {
                const newTracks = tracks.filter(nt => !p.tracks.some(t => t.id === nt.id));
                return { ...p, tracks: [...p.tracks, ...newTracks] };
            }
            return p;
        });
        await savePlaylists(updated);
    };

    const addToPlaylist = async (playlistId: string, track: Track) => {
        await addTracksToPlaylist(playlistId, [track]);
    };

    const removeFromPlaylist = async (playlistId: string, trackId: string) => {
        const updated = customPlaylists.map(p => {
            if (p.id === playlistId) {
                return { ...p, tracks: p.tracks.filter(t => t.id !== trackId) };
            }
            return p;
        });
        await savePlaylists(updated);
    };

    const removeFromQueue = (trackId: string) => {
        setCurrentQueue(prev => prev.filter(t => t.id !== trackId));
    };

    const clearQueue = () => {
        setCurrentQueue([]);
        if (sound) sound.stopAsync();
        setCurrentTrack(null);
        setIsPlaying(false);
    };

    const moveTracksToPlaylist = async (sourceId: string, targetId: string, trackIds: string[]) => {
        const sourcePlaylist = customPlaylists.find(p => p.id === sourceId);
        if (!sourcePlaylist) return;

        const tracksToMove = sourcePlaylist.tracks.filter(t => trackIds.includes(t.id));

        const updated = customPlaylists.map(p => {
            if (p.id === sourceId) {
                return { ...p, tracks: p.tracks.filter(t => !trackIds.includes(t.id)) };
            }
            if (p.id === targetId) {
                // Avoid duplicates in target
                const existingIds = new Set(p.tracks.map(t => t.id));
                const uniqueNewTracks = tracksToMove.filter(t => !existingIds.has(t.id));
                return { ...p, tracks: [...p.tracks, ...uniqueNewTracks] };
            }
            return p;
        });

        await savePlaylists(updated);
    };

    const stopPlayback = async () => {
        if (sound) {
            await sound.stopAsync();
            await sound.unloadAsync();
            setSound(null);
        }
        setCurrentTrack(null);
        setIsPlaying(false);
        setPosition(0);
    };

    const enqueueNext = (track: Track) => {
        if (!currentTrack) {
            playTrack(track);
            return;
        }

        setCurrentQueue(prev => {
            const currentIndex = prev.findIndex(t => t.id === currentTrack.id);
            // Remove if already in queue to avoid double entries, then insert after current
            const filtered = prev.filter(t => t.id !== track.id);
            const newIndex = currentIndex !== -1 ? currentIndex + 1 : 0;
            const newQueue = [...filtered];
            newQueue.splice(newIndex, 0, track);
            return newQueue;
        });
        Alert.alert("Queue Updated", `${track.title} will play next.`);
    };


    return (
        <AudioContext.Provider value={{
            currentTrack,
            isPlaying,
            playTrack,
            pauseTrack,
            resumeTrack,
            stopPlayback,
            playNext,
            enqueueNext,
            playPrev,
            seek,
            loadLocalMusic,
            playlist: currentQueue, // Expose current queue as "playlist" for specific screens
            customPlaylists,
            sound,
            position,
            duration,
            shuffleOn,
            repeatMode,
            toggleShuffle,
            toggleRepeat,
            createPlaylist,
            deletePlaylist,
            addToPlaylist,
            addTracksToPlaylist,
            moveTracksToPlaylist,
            removeFromPlaylist,
            trackOverrides,
            updateTrackMetadata,
            libraryTracks,
            removeFromQueue,
            clearQueue,
        }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};
