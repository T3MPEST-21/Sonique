import { usePlayerStore } from '@/stores/playerStore';
import { useEffect, useRef } from 'react';

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
};
