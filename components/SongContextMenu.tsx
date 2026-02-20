import { colors, fonts } from '@/constants/theme';
import { Track, useLibraryStore } from '@/stores/libraryStore';
import { usePlayerStore } from '@/stores/playerStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface Props {
    track: Track;
    visible: boolean;
    onClose: () => void;
    onAddToPlaylist: () => void; // Opens PlaylistPickerModal
}

export const SongContextMenu: React.FC<Props> = ({ track, visible, onClose, onAddToPlaylist }) => {
    const { toggleFavorite, isFavorite } = useLibraryStore();
    const { queue, play } = usePlayerStore();
    const favorite = isFavorite(track.id);

    const handlePlayNext = () => {
        // Insert after current track (index 0 = current)
        // For now, restart current queue with this track first — full "play next" queue insertion
        // requires a dedicated store action; simplified here.
        onClose();
    };

    const handleAddToQueue = () => {
        // usePlayerStore setQueue adds to end
        onClose();
    };

    const handleGoToArtist = () => {
        onClose();
        router.push(`/(tabs)/Artists/${encodeURIComponent(track.artist)}`);
    };

    const menuItems: { icon: string; label: string; action: () => void; color?: string }[] = [
        { icon: 'play-skip-forward', label: 'Play Next', action: handlePlayNext },
        { icon: 'add-circle-outline', label: 'Add to Queue', action: handleAddToQueue },
        { icon: 'musical-notes', label: 'Add to Playlist', action: () => { onClose(); onAddToPlaylist(); } },
        {
            icon: favorite ? 'heart' : 'heart-outline',
            label: favorite ? 'Remove from Favorites' : 'Add to Favorites',
            action: () => { toggleFavorite(track.id); onClose(); },
            color: favorite ? '#e74c3c' : undefined,
        },
        { icon: 'person', label: 'Go to Artist', action: handleGoToArtist },
    ];

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose}>
                <View style={styles.sheet}>
                    {/* Track info header */}
                    <View style={styles.header}>
                        <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                        <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
                    </View>
                    <View style={styles.divider} />

                    {menuItems.map((item) => (
                        <TouchableOpacity key={item.label} style={styles.item} onPress={item.action}>
                            <Ionicons
                                name={item.icon as any}
                                size={20}
                                color={item.color ?? colors.text}
                                style={styles.itemIcon}
                            />
                            <Text style={[styles.itemLabel, item.color ? { color: item.color } : null]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: colors.backgroundLight ?? '#1e1e1e',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 32,
        paddingTop: 8,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    trackTitle: {
        color: colors.text,
        fontSize: fonts.md,
        fontWeight: '700',
    },
    trackArtist: {
        color: colors.textMuted,
        fontSize: fonts.sm,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginHorizontal: 16,
        marginBottom: 8,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    itemIcon: {
        width: 28,
    },
    itemLabel: {
        color: colors.text,
        fontSize: fonts.md,
        marginLeft: 8,
    },
});
