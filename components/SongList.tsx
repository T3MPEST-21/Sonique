import { PlaylistPickerModal } from '@/components/PlaylistPickerModal';
import { SongContextMenu } from '@/components/SongContextMenu';
import { colors, fonts } from '@/constants/theme';
import { Track } from '@/stores/libraryStore';
import { usePlayerStore } from '@/stores/playerStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface SongListProps {
    tracks: Track[];
    /** When true, shows checkboxes for multi-select (used in song picker flow) */
    selectionMode?: boolean;
    selectedIds?: Set<string>;
    onSelectionChange?: (ids: Set<string>) => void;
    /** Reorder mode — shows ↑↓ arrows instead of ⋮ */
    reorderMode?: boolean;
    onMoveUp?: (index: number) => void;
    onMoveDown?: (index: number) => void;
    onMoveHoldUp?: (index: number) => void;
    onMoveHoldDown?: (index: number) => void;
}

const SongItem = ({
    track,
    index,
    isPlaying,
    onSelect,
    selectionMode,
    isSelected,
    onToggleSelect,
    reorderMode,
    onMoveUp,
    onMoveDown,
    onMenuPress,
}: {
    track: Track;
    index: number;
    isPlaying: boolean;
    onSelect: () => void;
    selectionMode?: boolean;
    isSelected?: boolean;
    onToggleSelect?: () => void;
    reorderMode?: boolean;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    onMenuPress: () => void;
}) => (
    <TouchableOpacity
        style={styles.itemContainer}
        onPress={selectionMode ? onToggleSelect : onSelect}
        activeOpacity={0.7}
    >
        {/* Left: checkbox OR reorder arrows OR artwork placeholder */}
        {selectionMode ? (
            <TouchableOpacity style={styles.checkbox} onPress={onToggleSelect}>
                <Ionicons
                    name={isSelected ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isSelected ? colors.primary : colors.textMuted}
                />
            </TouchableOpacity>
        ) : reorderMode ? (
            <View style={styles.reorderButtons}>
                <TouchableOpacity onPress={onMoveUp} style={styles.arrowBtn}>
                    <Ionicons name="chevron-up" size={18} color={colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onMoveDown} style={styles.arrowBtn}>
                    <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
                </TouchableOpacity>
            </View>
        ) : (
            <View style={styles.artworkPlaceholder}>
                <Ionicons name="musical-notes" size={22} color={colors.textMuted} />
            </View>
        )}

        {/* Track text */}
        <View style={styles.textContainer}>
            <Text numberOfLines={1} style={[styles.title, isPlaying && styles.activeTitle]}>
                {track.title || 'Unknown Title'}
            </Text>
            <Text numberOfLines={1} style={styles.artist}>
                {track.artist || 'Unknown Artist'}
            </Text>
        </View>

        {/* Right: ⋮ menu (hidden in selection/reorder mode) */}
        {!selectionMode && !reorderMode && (
            <TouchableOpacity onPress={onMenuPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.menuBtn}>
                <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
            </TouchableOpacity>
        )}
    </TouchableOpacity>
);

export const SongList = ({
    tracks,
    selectionMode,
    selectedIds,
    onSelectionChange,
    reorderMode,
    onMoveUp,
    onMoveDown,
}: SongListProps) => {
    const { play, activeTrack } = usePlayerStore();
    const [menuTrack, setMenuTrack] = useState<Track | null>(null);
    const [pickerVisible, setPickerVisible] = useState(false);

    const toggleSelect = (id: string) => {
        if (!selectedIds || !onSelectionChange) return;
        const next = new Set(selectedIds);
        next.has(id) ? next.delete(id) : next.add(id);
        onSelectionChange(next);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={tracks}
                renderItem={({ item, index }) => (
                    <SongItem
                        track={item}
                        index={index}
                        isPlaying={activeTrack?.id === item.id}
                        onSelect={() => play(item, tracks)}
                        selectionMode={selectionMode}
                        isSelected={selectedIds?.has(item.id)}
                        onToggleSelect={() => toggleSelect(item.id)}
                        reorderMode={reorderMode}
                        onMoveUp={() => onMoveUp?.(index)}
                        onMoveDown={() => onMoveDown?.(index)}
                        onMenuPress={() => setMenuTrack(item)}
                    />
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 120 }}
            />

            {/* Song context menu */}
            {menuTrack && (
                <SongContextMenu
                    track={menuTrack}
                    visible={!!menuTrack}
                    onClose={() => setMenuTrack(null)}
                    onAddToPlaylist={() => setPickerVisible(true)}
                />
            )}

            {/* Playlist picker */}
            {menuTrack && (
                <PlaylistPickerModal
                    visible={pickerVisible}
                    trackIds={[menuTrack.id]}
                    onClose={() => { setPickerVisible(false); setMenuTrack(null); }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    artworkPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: colors.backgroundLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    checkbox: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    reorderButtons: {
        width: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        gap: 2,
    },
    arrowBtn: {
        padding: 4,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: fonts.sm,
        color: colors.text,
        fontWeight: '600',
    },
    activeTitle: {
        color: colors.primary,
    },
    artist: {
        fontSize: fonts.xs,
        color: colors.textMuted,
        marginTop: 4,
    },
    menuBtn: {
        paddingHorizontal: 6,
        paddingVertical: 4,
    },
});
