import { PlaylistPickerModal } from '@/components/PlaylistPickerModal';
import { SongContextMenu } from '@/components/SongContextMenu';
import { useTheme } from '@/constants/theme';
import { Track } from '@/stores/libraryStore';
import { usePlayerStore } from '@/stores/playerStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    Pressable,
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
    onMoveStart?: (index: number, direction: 'up' | 'down') => void;
    onMoveEnd?: () => void;
    onRemove?: (track: Track) => void;
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
    onMoveStart,
    onMoveEnd,
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
    onMoveStart?: (direction: 'up' | 'down') => void;
    onMoveEnd?: () => void;
    onMenuPress: () => void;
}) => {
    const { colors, fonts, cornerRadius } = useTheme();
    return (
        <TouchableOpacity
            style={[styles.itemContainer, isPlaying && { backgroundColor: colors.primary + '15' }]}
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
                    <Pressable
                        onPressIn={() => onMoveStart?.('up')}
                        onPressOut={onMoveEnd}
                        style={({ pressed }) => [styles.arrowBtn, pressed && { opacity: 0.5 }]}
                    >
                        <Ionicons name="chevron-up" size={18} color={colors.textMuted} />
                    </Pressable>
                    <Pressable
                        onPressIn={() => onMoveStart?.('down')}
                        onPressOut={onMoveEnd}
                        style={({ pressed }) => [styles.arrowBtn, pressed && { opacity: 0.5 }]}
                    >
                        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
                    </Pressable>
                </View>
            ) : (
                <View style={[styles.artworkPlaceholder, { borderRadius: cornerRadius * 0.7, backgroundColor: colors.backgroundLight }]}>
                    <Ionicons name="musical-notes" size={22} color={colors.textMuted} />
                </View>
            )}

            {/* Track text */}
            <View style={styles.textContainer}>
                <Text numberOfLines={1} style={[styles.title, { color: isPlaying ? colors.primary : colors.text, fontSize: fonts.sm }]}>
                    {track.title || 'Unknown Title'}
                </Text>
                <Text numberOfLines={1} style={[styles.artist, { color: colors.textMuted, fontSize: fonts.xs }]}>
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
};

export const SongList = ({
    tracks,
    selectionMode,
    selectedIds,
    onSelectionChange,
    reorderMode,
    onMoveStart,
    onMoveEnd,
    onRemove,
}: SongListProps) => {
    const { colors, fonts } = useTheme();
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
                        onMoveStart={(dir) => onMoveStart?.(index, dir)}
                        onMoveEnd={onMoveEnd}
                        onMenuPress={() => setMenuTrack(item)}
                    />
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="musical-notes-outline" size={64} color={colors.textMuted} style={{ opacity: 0.3 }} />
                        <Text style={[styles.emptyText, { color: colors.textMuted, fontSize: fonts.md }]}>
                            No songs found
                        </Text>
                    </View>
                }
            />

            {/* Song context menu */}
            {menuTrack && (
                <SongContextMenu
                    track={menuTrack}
                    visible={!!menuTrack}
                    onClose={() => setMenuTrack(null)}
                    onAddToPlaylist={() => setPickerVisible(true)}
                    onRemove={onRemove ? () => onRemove(menuTrack) : undefined}
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
        fontWeight: '600',
    },
    artist: {
        marginTop: 4,
    },
    menuBtn: {
        paddingHorizontal: 6,
        paddingVertical: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        paddingVertical: 100,
    },
    emptyText: {
        fontWeight: '600',
    },
});
