import { FAVORITES_ID } from '@/stores/libraryStore';
import { Redirect } from 'expo-router';
import React from 'react';

/**
 * The Favorites tab simply redirects to the Favorites playlist detail screen.
 * This makes Favorites a first-class playlist, not a separate concept.
 */
export default function FavoritesRedirect() {
    return <Redirect href={`/(tabs)/Playlists/${FAVORITES_ID}`} />;
}
