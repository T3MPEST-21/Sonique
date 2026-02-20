import { usePlayerStore } from '@/stores/playerStore';
import { useEffect, useRef } from 'react';
import TrackPlayer, { Event } from 'react-native-track-player';

export const useSetupTrackPlayer = ({ onLoad }: { onLoad: () => void }) => {
    const { setupPlayer } = usePlayerStore();
    const isInitialized = useRef(false);

    useEffect(() => {
        const setup = async () => {
            if (!isInitialized.current) {
                await setupPlayer();
                isInitialized.current = true;
                onLoad();
            }
        };

        setup();
    }, []);

    // Sync store with player events
    useEffect(() => {
        const sub = TrackPlayer.addEventListener(Event.PlaybackTrackChanged, async (event) => {
            if (event.nextTrack !== undefined && event.nextTrack !== null) {
                const track = await TrackPlayer.getTrack(event.nextTrack);
                // We need to map this back to our Track interface or update store to handle partials
                // efficiently. For now, let's just use what we get, but we need the full Track object usually.
                // Or better, we just update the Queue/Active index.

                // Simplified: Just finding it in the queue for now might be safer if we have the queue.
                // But TrackPlayer.getTrack returns the object we added.
                if (track) {
                    usePlayerStore.setState({ activeTrack: track as any });
                }
            }
        });

        return () => {
            sub.remove();
        };
    }, []);
};
