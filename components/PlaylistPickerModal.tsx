import { GeneratedArtwork } from '@/components/GeneratedArtwork';
import { colors, fonts } from '@/constants/theme';
import { Playlist, useLibraryStore } from '@/stores/libraryStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface Props {
    visible: boolean;
    onClose: () => void;
    trackIds: string[];        // tracks to add
    onDone?: () => void;
}

export const PlaylistPickerModal: React.FC<Props> = ({ visible, onClose, trackIds, onDone }) => {
    const { playlists, createPlaylist, addTracksToPlaylist } = useLibraryStore();
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');

    const handleAdd = (playlist: Playlist) => {
        addTracksToPlaylist(playlist.id, trackIds);
        onDone?.();
        onClose();
    };

    const handleCreate = () => {
        const name = newName.trim();
        if (!name) return;
        const playlist = createPlaylist(name);
        addTracksToPlaylist(playlist.id, trackIds);
        setNewName('');
        setIsCreating(false);
        onDone?.();
        onClose();
    };

    return (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Pressable style={styles.sheet} onPress={() => { }}>
                    <View style={styles.handle} />
                    <Text style={styles.title}>Add to Playlist</Text>

                    {/* Create new playlist row */}
                    {isCreating ? (
                        <View style={styles.createRow}>
                            <TextInput
                                style={styles.input}
                                placeholder="Playlist name"
                                placeholderTextColor={colors.textMuted}
                                value={newName}
                                onChangeText={setNewName}
                                autoFocus
                                onSubmitEditing={handleCreate}
                                returnKeyType="done"
                            />
                            <TouchableOpacity onPress={handleCreate} style={styles.createConfirm}>
                                <Text style={styles.createConfirmText}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.newRow} onPress={() => setIsCreating(true)}>
                            <View style={styles.newIcon}>
                                <Ionicons name="add" size={22} color={colors.primary} />
                            </View>
                            <Text style={styles.newLabel}>New Playlist</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.divider} />

                    <FlatList
                        data={playlists}
                        keyExtractor={p => p.id}
                        style={{ maxHeight: 380 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.row} onPress={() => handleAdd(item)}>
                                <GeneratedArtwork name={item.name} size={48} style={styles.artwork} />
                                <View style={styles.rowText}>
                                    <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
                                    <Text style={styles.rowCount}>{item.trackIds.length} songs</Text>
                                </View>
                                <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <Text style={styles.empty}>No playlists yet. Create one above!</Text>
                        }
                    />
                </Pressable>
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
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40,
        paddingTop: 8,
    },
    handle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignSelf: 'center',
        marginBottom: 12,
    },
    title: {
        color: colors.text,
        fontSize: fonts.lg,
        fontWeight: '700',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    newRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    newIcon: {
        width: 48,
        height: 48,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: colors.primary,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    newLabel: {
        color: colors.primary,
        fontSize: fonts.md,
        fontWeight: '600',
    },
    createRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 4,
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: colors.text,
        fontSize: fonts.md,
    },
    createConfirm: {
        backgroundColor: colors.primary,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    createConfirmText: {
        color: colors.text,
        fontWeight: '700',
        fontSize: fonts.sm,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginHorizontal: 16,
        marginVertical: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    artwork: {
        marginRight: 14,
    },
    rowText: {
        flex: 1,
    },
    rowName: {
        color: colors.text,
        fontSize: fonts.md,
        fontWeight: '600',
    },
    rowCount: {
        color: colors.textMuted,
        fontSize: fonts.sm,
        marginTop: 2,
    },
    empty: {
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: 24,
        fontSize: fonts.sm,
    },
});
