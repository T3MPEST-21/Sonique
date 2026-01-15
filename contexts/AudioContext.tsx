import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

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
    playTrack: (track: Track) => Promise<void>;
    pauseTrack: () => Promise<void>;
    resumeTrack: () => Promise<void>;
    loadLocalMusic: () => Promise<Track[]>;
    sound: Audio.Sound | null;
    position: number;
    duration: number;
    activeMood: string;
    setActiveMood: (mood: string) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [activeMood, setActiveMood] = useState('All Moods');

    // Setup Audio Mode on mount
    useEffect(() => {
        const setupAudio = async () => {
            try {
                await Audio.setAudioModeAsync({
                    staysActiveInBackground: true,
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                    interruptionModeIOS: InterruptionModeIOS.DuckOthers,
                    interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
                });
            } catch (error) {
                console.error("Error setting up audio mode", error);
            }
        };
        setupAudio();
    }, []);

    // Unload sound on unmount
    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const playTrack = async (track: Track) => {
        try {
            // Include complex logic: if same song, toggle play code etc.
            if (currentTrack?.id === track.id && sound) {
                if (isPlaying) {
                    await pauseTrack();
                } else {
                    await resumeTrack();
                }
                return;
            }

            // Unload previous sound
            if (sound) {
                await sound.unloadAsync();
            }

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: track.uri },
                { shouldPlay: true }
            );

            setSound(newSound);
            setCurrentTrack(track);
            setIsPlaying(true);

            // Listen to playback updates
            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded) {
                    setPosition(status.positionMillis);
                    setDuration(status.durationMillis || 0);
                    setIsPlaying(status.isPlaying);

                    // Handle completion
                    if (status.didJustFinish) {
                        setIsPlaying(false);
                        // Optional: Play next logic here
                    }

                    // Handle interruptions (ducking/pausing)
                    if (status.isLoaded && !status.isPlaying && status.shouldPlay) {
                        // This usually happens during an interruption if not handled by OS automatically
                        console.log("Audio interrupted or paused by system");
                    }
                }
            });

        } catch (error) {
            console.error("Error playing audio", error);
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

    return (
        <AudioContext.Provider value={{
            currentTrack,
            isPlaying,
            playTrack,
            pauseTrack,
            resumeTrack,
            loadLocalMusic,
            sound,
            position,
            duration,
            activeMood,
            setActiveMood,
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
