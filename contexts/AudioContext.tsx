import { Audio } from 'expo-av';
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
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);

    // Setup Audio Mode on mount
    useEffect(() => {
        Audio.setAudioModeAsync({
            staysActiveInBackground: true,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
        });
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
                    setDuration(status.durationMillis || 0); // avoid null
                    setIsPlaying(status.isPlaying);
                    if (status.didJustFinish) {
                        setIsPlaying(false);
                        // Optional: Play next logic here
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

    const loadLocalMusic = async (): Promise<Track[]> => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant permission to access your audio files');
            return [];
        }

        const media = await MediaLibrary.getAssetsAsync({
            mediaType: 'audio',
            first: 50, // Limit for performance initially
        });

        // Map to our Track interface
        return media.assets.map((asset) => ({
            id: asset.id,
            title: asset.filename.replace(/\.[^/.]+$/, ""), // remove extension
            artist: 'Unknown Artist', // MediaLibrary might not separate artist well on all devices
            uri: asset.uri,
            duration: asset.duration * 1000,
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
            duration
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
