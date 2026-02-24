import { useTheme } from '@/constants/theme';
import { Playlist } from '@/stores/libraryStore';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PlaylistListItemProps {
    playlist: Playlist;
    onPress: () => void;
}

const PlaylistListItem = ({ playlist, onPress }: PlaylistListItemProps) => {
    const { colors, fonts, cornerRadius } = useTheme();
    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: colors.backgroundLight, borderRadius: cornerRadius }]}
            onPress={onPress}
        >
            <View style={[styles.artworkContainer, { borderRadius: cornerRadius * 0.7 }]}>
                <Ionicons name="musical-notes" size={24} color={colors.textMuted} />
            </View>
            <View style={styles.infoContainer}>
                <Text style={[styles.name, { color: colors.text, fontSize: fonts.md }]}>{playlist.name}</Text>
                <Text style={[styles.count, { color: colors.textMuted, fontSize: fonts.xs }]}>{playlist.trackIds.length} Songs</Text>
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
        paddingHorizontal: 12,
        marginBottom: 10,
    },
    artworkContainer: {
        width: 50,
        height: 50,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoContainer: {
        flex: 1,
    },
    name: {
        fontWeight: '600',
    },
    count: {
        marginTop: 4,
    }
});
