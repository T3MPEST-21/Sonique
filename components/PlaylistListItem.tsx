import { colors, fonts } from '@/constants/theme';
import { Playlist } from '@/stores/libraryStore';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PlaylistListItemProps {
    playlist: Playlist;
    onPress: () => void;
}

const PlaylistListItem = ({ playlist, onPress }: PlaylistListItemProps) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.artworkContainer}>
                <Ionicons name="musical-notes" size={24} color={colors.textMuted} />
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.name}>{playlist.name}</Text>
                <Text style={styles.count}>{playlist.tracks.length} Songs</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
    );
};

export default PlaylistListItem;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
    },
    artworkContainer: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: colors.backgroundLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoContainer: {
        flex: 1,
    },
    name: {
        fontSize: fonts.md,
        color: colors.text,
        fontWeight: '600',
    },
    count: {
        fontSize: fonts.xs,
        color: colors.textMuted,
        marginTop: 4,
    }
});
