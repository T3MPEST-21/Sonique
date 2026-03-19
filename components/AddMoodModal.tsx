import { useTheme } from '@/constants/theme';
import { Mood, useMoodStore } from '@/stores/moodStore';
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
    View,
} from 'react-native';

// Curated icon pool for user-created moods
const ICON_OPTIONS: string[] = [
    'heart', 'star', 'flame', 'snow', 'sunny', 'thunderstorm',
    'cafe', 'beer', 'pizza', 'football', 'bicycle', 'car',
    'headset', 'mic', 'radio', 'volume-high', 'camera', 'brush',
    'book', 'game-controller',
];

// Curated color palette
const COLOR_OPTIONS: string[] = [
    '#e74c3c', '#e91e63', '#9b59b6', '#3498db', '#1abc9c',
    '#2ecc71', '#f39c12', '#e67e22', '#7f8c8d', '#2c3e50',
    '#fd79a8', '#00b894',
];

interface Props {
    visible: boolean;
    onClose: () => void;
}

export const AddMoodModal: React.FC<Props> = ({ visible, onClose }) => {
    const { colors, fonts, cornerRadius, isDark } = useTheme();
    const { addMood } = useMoodStore();
    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('heart');
    const [selectedColor, setSelectedColor] = useState('#e74c3c');

    const handleAdd = () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        addMood({ name: trimmed, icon: selectedIcon, color: selectedColor });
        setName('');
        setSelectedIcon('heart');
        setSelectedColor('#e74c3c');
        onClose();
    };

    const handleClose = () => {
        setName('');
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <Pressable style={styles.backdrop} onPress={handleClose}>
                <Pressable style={[styles.sheet, {
                    backgroundColor: isDark ? '#1e1e1e' : colors.backgroundLight,
                    borderRadius: cornerRadius + 6,
                }]} onPress={() => {}}>
                    <Text style={[styles.title, { color: colors.text, fontSize: fonts.md }]}>
                        New Mood
                    </Text>

                    {/* Preview */}
                    <View style={[styles.preview, { backgroundColor: selectedColor + '22', borderColor: selectedColor + '55', borderRadius: cornerRadius }]}>
                        <Ionicons name={selectedIcon as any} size={28} color={selectedColor} />
                        <Text style={[styles.previewName, { color: selectedColor, fontSize: fonts.sm }]}>
                            {name || 'Mood Name'}
                        </Text>
                    </View>

                    {/* Name Input */}
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Mood name..."
                        placeholderTextColor={colors.textMuted}
                        maxLength={20}
                        style={[styles.input, {
                            color: colors.text,
                            backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
                            borderRadius: cornerRadius,
                            fontSize: fonts.sm,
                        }]}
                    />

                    {/* Icon Picker */}
                    <Text style={[styles.sectionLabel, { color: colors.textMuted, fontSize: fonts.xs }]}>ICON</Text>
                    <View style={styles.iconGrid}>
                        {ICON_OPTIONS.map(icon => (
                            <TouchableOpacity
                                key={icon}
                                onPress={() => setSelectedIcon(icon)}
                                style={[styles.iconOption, {
                                    backgroundColor: selectedIcon === icon ? selectedColor + '33' : 'transparent',
                                    borderColor: selectedIcon === icon ? selectedColor : 'transparent',
                                    borderRadius: cornerRadius,
                                }]}
                            >
                                <Ionicons name={icon as any} size={22} color={selectedIcon === icon ? selectedColor : colors.textMuted} />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Color Picker */}
                    <Text style={[styles.sectionLabel, { color: colors.textMuted, fontSize: fonts.xs }]}>COLOR</Text>
                    <View style={styles.colorGrid}>
                        {COLOR_OPTIONS.map(color => (
                            <TouchableOpacity
                                key={color}
                                onPress={() => setSelectedColor(color)}
                                style={[styles.colorSwatch, {
                                    backgroundColor: color,
                                    borderWidth: selectedColor === color ? 3 : 0,
                                    borderColor: colors.text,
                                }]}
                            />
                        ))}
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={handleClose} style={styles.cancelBtn}>
                            <Text style={{ color: colors.textMuted, fontSize: fonts.sm }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleAdd}
                            disabled={!name.trim()}
                            style={[styles.addBtn, { backgroundColor: name.trim() ? selectedColor : colors.border, borderRadius: cornerRadius }]}
                        >
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: fonts.sm }}>Add Mood</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    sheet: {
        width: '100%',
        padding: 24,
    },
    title: {
        fontWeight: '800',
        marginBottom: 18,
        textAlign: 'center',
    },
    preview: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        alignSelf: 'center',
        paddingHorizontal: 24,
    },
    previewName: {
        fontWeight: '700',
    },
    input: {
        padding: 14,
        marginBottom: 16,
    },
    sectionLabel: {
        fontWeight: '700',
        letterSpacing: 0.5,
        marginBottom: 10,
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 18,
    },
    iconOption: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 22,
    },
    colorSwatch: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    cancelBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    addBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
});
