import { MOODS } from '@/constants/moods';
import { COLORS } from '@/constants/theme';
import { useAudio } from '@/contexts/AudioContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface MetadataEditModalProps {
    visible: boolean;
    onClose: () => void;
    track: any;
}



const MetadataEditModal = ({ visible, onClose, track }: MetadataEditModalProps) => {
    const { updateTrackMetadata, trackOverrides } = useAudio();
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [album, setAlbum] = useState('');
    const [selectedMood, setSelectedMood] = useState<string | null>(null);

    useEffect(() => {
        if (track) {
            const overrides = trackOverrides[track.id] || {};
            setTitle(overrides.title || track.title || '');
            setArtist(overrides.artist || track.artist || 'Unknown Artist');
            setAlbum(overrides.album || '');
            setSelectedMood(overrides.mood || null);
        }
    }, [track, visible]);

    const handleSave = async () => {
        if (!track) return;

        await updateTrackMetadata(track.id, {
            title,
            artist,
            album,
            mood: selectedMood
        });
        onClose();
    };

    if (!track) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Edit Track Info</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.section}>
                                <Text style={styles.label}>Title</Text>
                                <TextInput
                                    style={styles.input}
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholder="Enter title"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                />
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.label}>Artist</Text>
                                <TextInput
                                    style={styles.input}
                                    value={artist}
                                    onChangeText={setArtist}
                                    placeholder="Enter artist"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                />
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.label}>Mood Tag</Text>
                                <View style={styles.moodGrid}>
                                    {MOODS.map((mood) => (
                                        <TouchableOpacity
                                            key={mood.id}
                                            style={[
                                                styles.moodItem,
                                                selectedMood === mood.id && { borderColor: COLORS.primary, backgroundColor: 'rgba(108, 99, 255, 0.1)' }
                                            ]}
                                            onPress={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
                                        >
                                            <Text style={styles.emoji}>{mood.emoji}</Text>
                                            <Text style={[
                                                styles.moodLabel,
                                                selectedMood === mood.id && { color: COLORS.primary }
                                            ]}>{mood.title}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

export default MetadataEditModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        padding: 20,
    },
    keyboardView: {
        justifyContent: 'center',
    },
    modalContent: {
        backgroundColor: '#1E1E2E',
        borderRadius: 24,
        padding: 20,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '700',
    },
    section: {
        marginBottom: 20,
    },
    label: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 15,
        color: '#FFF',
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    moodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    moodItem: {
        width: '31%',
        aspectRatio: 1,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    moodLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        marginTop: 5,
        fontWeight: '500',
    },
    emoji: {
        fontSize: 24,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    }
});
