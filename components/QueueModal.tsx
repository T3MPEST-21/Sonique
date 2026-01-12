import { COLORS } from '@/constants/theme';
import { useAudio } from '@/contexts/AudioContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

const { height } = Dimensions.get('window');

interface QueueModalProps {
    visible: boolean;
    onClose: () => void;
}

const QueueModal = ({ visible, onClose }: QueueModalProps) => {
    const {
        playlist: currentQueue,
        currentTrack,
        playTrack,
        removeFromQueue,
        clearQueue
    } = useAudio();

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const isCurrent = currentTrack?.id === item.id;

        return (
            <View style={[styles.itemContainer, isCurrent && styles.activeItem]}>
                <TouchableOpacity
                    style={styles.itemContent}
                    onPress={() => {
                        playTrack(item, currentQueue);
                    }}
                >
                    <Image source={require('@/assets/images/chill_mood_1768080634061.png')} style={styles.art} />
                    <View style={styles.info}>
                        <Text style={[styles.title, isCurrent && styles.activeText]} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.artist} numberOfLines={1}>{item.artist}</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFromQueue(item.id)}
                >
                    <Ionicons name="close" size={20} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <View style={styles.header}>
                                <Text style={styles.headerTitle}>Next Up</Text>
                                <View style={styles.headerActions}>
                                    <TouchableOpacity style={styles.clearButton} onPress={clearQueue}>
                                        <Text style={styles.clearText}>Clear</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                        <Ionicons name="chevron-down" size={24} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <FlatList
                                data={currentQueue}
                                renderItem={renderItem}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.emptyText}>Queue is empty</Text>
                                    </View>
                                }
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default QueueModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: height * 0.7, // 70% height
        backgroundColor: '#1E1E2E',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 10,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    clearButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 14,
    },
    clearText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    closeButton: {
        padding: 5,
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        padding: 8,
    },
    activeItem: {
        backgroundColor: 'rgba(108, 99, 255, 0.15)',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    itemContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    art: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#333',
    },
    info: {
        marginLeft: 12,
        flex: 1,
    },
    title: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 2,
    },
    activeText: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    artist: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
    },
    removeButton: {
        padding: 10,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 16,
    }
});
