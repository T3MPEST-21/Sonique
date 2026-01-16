import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as MediaLibrary from 'expo-media-library';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Playlist, Storage } from '../helpers/storage';

// Define the shape of a Track
export interface Track {
    id: string;
    title: string;
    artist: string;
    uri: string;
    artwork?: string;
    duration: number;
    mood?: string;
}

interface AudioContextType {
    currentTrack: Track | null;
    isPlaying: boolean;
    playTrack: (track: Track, newQueue?: Track[]) => Promise<void>;
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
    removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
    renamePlaylist: (playlistId: string, newName: string) => Promise<void>;
    deletePlaylist: (playlistId: string) => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
    const [player, setPlayer] = useState<AudioPlayer | null>(null);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [queue, setQueue] = useState<Track[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [activeMood, setActiveMood] = useState('All Moods');
    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    // Setup Audio Mode and Load Data on mount
    useEffect(() => {
        const setupAudio = async () => {
            try {
                await setAudioModeAsync({
                    shouldPlayInBackground: true,
                    playsInSilentMode: true,
                    interruptionMode: 'doNotMix',
                });

                const savedPlaylists = await Storage.loadPlaylists();
                setPlaylists(savedPlaylists);
            } catch (error) {
                console.error("Error setting up audio mode or loading data", error);
            }
        };
        setupAudio();
    }, []);

    // Cleanup player on unmount
    useEffect(() => {
        return () => {
            if (player) {
                player.remove();
            }
        };
    }, [player]);

    const playTrack = async (track: Track, newQueue?: Track[]) => {
        try {
            if (newQueue) {
                setQueue(newQueue);
            } else if (queue.length === 0) {
                setQueue([track]);
            }

            if (currentTrack?.id === track.id && player) {
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
                currentPlayer = createAudioPlayer(track.uri, { updateInterval: 100 });
                setPlayer(currentPlayer);
            } else {
                currentPlayer.replace(track.uri);
            }

            setCurrentTrack(track);
            setIsPlaying(true);
            currentPlayer.play();

            // Set lock screen info - wrap in safety check as it may not be available on all Android builds/versions
            if (typeof currentPlayer.setActiveForLockScreen === 'function') {
                currentPlayer.setActiveForLockScreen(true, {
                    title: track.title,
                    artist: track.artist || 'Sonique Artist',
                    artworkUrl: track.artwork,
                });
            }

            // Listen to playback updates
            currentPlayer.addListener('playbackStatusUpdate', (status) => {
                setPosition(status.currentTime * 1000);
                setDuration(status.duration * 1000);
                setIsPlaying(status.playing);

                if (status.didJustFinish) {
                    nextTrack();
                }
            });

        } catch (error) {
            console.error("Error playing audio", error);
        }
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
        const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
        const nextIndex = (currentIndex + 1) % queue.length;
        if (nextIndex !== -1) {
            playTrack(queue[nextIndex]);
        }
    };

    const previousTrack = () => {
        if (queue.length === 0) return;
        const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) prevIndex = queue.length - 1;
        playTrack(queue[prevIndex]);
    };

    const getMoodForTrack = (filename: string): string => {
        const name = filename.toLowerCase();
        if (name.includes('chill') || name.includes('relax') || name.includes('ambient') || name.includes('space')) return 'Calm';
        if (name.includes('run') || name.includes('workout') || name.includes('gym') || name.includes('fast') || name.includes('gym')) return 'Workout';
        if (name.includes('party') || name.includes('dance') || name.includes('energy') || name.includes('upbeat')) return 'Energetic';
        if (name.includes('sad') || name.includes('cry') || name.includes('blue') || name.includes('night') || name.includes('midnight')) return 'Melancholic';
        if (name.includes('study') || name.includes('focus') || name.includes('deep') || name.includes('work')) return 'Focus';

        // Randomly assign a mood if no keywords found for "spirit" variety, 
        // or default to "Calm" for local testing if preferred.
        const moods = ['Calm', 'Energetic', 'Melancholic', 'Focus', 'Workout'];
        return moods[Math.floor(Math.random() * moods.length)];
    };

    const loadLocalMusic = async (): Promise<Track[]> => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant permission to access your audio files');
            return [];
        }

        const media = await MediaLibrary.getAssetsAsync({
            mediaType: 'audio',
            first: 50,
        });

        // Map to our Track interface with improved metadata
        return media.assets.map((asset) => ({
            id: asset.id,
            title: asset.filename.replace(/\.[^/.]+$/, ""), // remove extension
            artist: 'Unknown Artist',
            uri: asset.uri,
            duration: asset.duration * 1000,
            artwork: undefined, // Could add album art extraction if needed
            mood: getMoodForTrack(asset.filename),
        }));
    };

    // Playlist Operations
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
        const updatedPlaylists = playlists.map(p => {
            if (p.id === playlistId) {
                // Prevent duplicates
                if (p.tracks.find(t => t.id === track.id)) return p;
                return { ...p, tracks: [...p.tracks, track] };
            }
            return p;
        });
        setPlaylists(updatedPlaylists);
        await Storage.savePlaylists(updatedPlaylists);
    };

    const removeTrackFromPlaylist = async (playlistId: string, trackId: string) => {
        const updatedPlaylists = playlists.map(p => {
            if (p.id === playlistId) {
                return { ...p, tracks: p.tracks.filter(t => t.id !== trackId) };
            }
            return p;
        });
        setPlaylists(updatedPlaylists);
        await Storage.savePlaylists(updatedPlaylists);
    };

    const renamePlaylist = async (playlistId: string, newName: string) => {
        const updatedPlaylists = playlists.map(p => {
            if (p.id === playlistId) {
                return { ...p, name: newName };
            }
            return p;
        });
        setPlaylists(updatedPlaylists);
        await Storage.savePlaylists(updatedPlaylists);
    };

    const deletePlaylist = async (playlistId: string) => {
        const updated = playlists.filter(p => p.id !== playlistId);
        setPlaylists(updated);
        await Storage.savePlaylists(updated);
    };

    return (
        <AudioContext.Provider value={{
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
