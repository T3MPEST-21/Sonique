import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({
    id: 'apollo-storage',
});

export const StorageKeys = {
    LIBRARY_CACHE: 'library_cache',
    PLAYER_STATE: 'player_state',
    USER_PREFS: 'user_prefs',
};
