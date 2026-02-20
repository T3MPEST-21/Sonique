import { colors, fonts, screenPadding } from '@/constants/theme';
import { useLibraryStore } from '@/stores/libraryStore';
import { Ionicons } from '@expo/vector-icons';
// import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ArtistsScreen = () => {
    const { tracks } = useLibraryStore();
    const insets = useSafeAreaInsets();

    const artists = useMemo(() => {
        const artistMap = new Set<string>();
        tracks.forEach(track => {
            if (track.artist && track.artist !== '<unknown>') {
                artistMap.add(track.artist);
            }
        });
        return Array.from(artistMap).sort();
    }, [tracks]);

    const handlePress = (artist: string) => {
        router.push(`/(tabs)/Artists/${artist}`);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Text style={styles.header}>Artists</Text>
            <FlatList
                data={artists}
                // estimatedItemSize={60}
                contentContainerStyle={{ paddingBottom: 120 }}
                renderItem={({ item }: { item: string }) => (
                    <TouchableOpacity style={styles.item} onPress={() => handlePress(item)}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="person" size={24} color={colors.textMuted} />
                        </View>
                        <Text style={styles.artistName}>{item}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

export default ArtistsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.text,
        paddingHorizontal: screenPadding.horizontal,
        marginBottom: 16,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: screenPadding.horizontal,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.backgroundLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    artistName: {
        fontSize: fonts.md,
        color: colors.text,
    }
});
