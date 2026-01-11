import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
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
    pauseTrack: () => Promise<void>;
    resumeTrack: () => Promise<void>;
    playNext: () => Promise<void>;
    playPrev: () => Promise<void>;
    seek: (position: number) => Promise<void>;

    // Data
    playlist: Track[]; // The current queue (could be library or a specific playlist)
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
    removeFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;

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

    // Persist Playlists
    useEffect(() => {
        loadPlaylists();
    }, []);

    const loadPlaylists = async () => {
        try {
            const stored = await AsyncStorage.getItem('customPlaylists');
            if (stored) {
                setCustomPlaylists(JSON.parse(stored));
            }
        } catch (e) {
            console.log("Failed to load playlists", e);
        }
    };

    const savePlaylists = async (playlists: Playlist[]) => {
        setCustomPlaylists(playlists);
        await AsyncStorage.setItem('customPlaylists', JSON.stringify(playlists));
    };

    // Setup Audio Mode
    useEffect(() => {
        Audio.setAudioModeAsync({
            staysActiveInBackground: true,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
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
            first: 200,
            sortBy: [MediaLibrary.SortBy.modificationTime],
        });

        const tracks = media.assets.map((asset) => ({
            id: asset.id,
            title: asset.filename.replace(/\.[^/.]+$/, ""),
            artist: 'Unknown Artist',
            uri: asset.uri,
            duration: asset.duration,
            modificationTime: asset.modificationTime,
            size: 0,
        }));

        setLibraryTracks(tracks);
        // Initially, the queue is the library
        if (currentQueue.length === 0) {
            setCurrentQueue(tracks);
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

    const addToPlaylist = async (playlistId: string, track: Track) => {
        const updated = customPlaylists.map(p => {
            if (p.id === playlistId) {
                // Prevent duplicates? logic can be optional
                if (p.tracks.some(t => t.id === track.id)) return p;
                return { ...p, tracks: [...p.tracks, track] };
            }
            return p;
        });
        await savePlaylists(updated);
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


    return (
        <AudioContext.Provider value={{
            currentTrack,
            isPlaying,
            playTrack,
            pauseTrack,
            resumeTrack,
            playNext,
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
            removeFromPlaylist,
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
