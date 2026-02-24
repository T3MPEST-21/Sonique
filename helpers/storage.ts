import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({
    id: 'music-app-storage',
});

export const StorageKeys = {
    THEME_MODE: 'theme_mode',
    LIBRARY_CACHE: 'library_cache',
    QUEUE_STATE: 'queue_state',
    PLAYER_STATE: 'player_state',
} as const;
