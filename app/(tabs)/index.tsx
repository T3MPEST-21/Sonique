import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, FlatList, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAudio } from '../../contexts/AudioContext';
import { hp } from '../../helpers/common';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 10;
const CARD_WIDTH = (width - 40 - (CARD_MARGIN * 2)) / 2;

const MOODS = [
    {
        id: '1',
        title: 'Energetic',
        emoji: '⚡',
        image: require('@/assets/images/energetic_mood_1768080617113.png'),
    },
    {
        id: '2',
        title: 'Chill',
        emoji: '🧘',
        image: require('@/assets/images/chill_mood_1768080634061.png'),
    },
    {
        id: '3',
        title: 'Melancholy',
        emoji: '🌧️',
        image: require('@/assets/images/melancholic_mood_1768080659321.png'),
    },
    {
        id: '4',
        title: 'Focus',
        emoji: '🧠',
        image: require('@/assets/images/focus_mood_1768080676224.png'),
    },
    {
        id: '5',
        title: 'Party',
        emoji: '🔥',
        image: require('@/assets/images/party_mood_1768080705615.png'),
    },
    {
        id: '6',
        title: 'Sleepy',
        emoji: '💤',
        image: require('@/assets/images/sleepy_mood_1768080726139.png'),
    },
    {
        id: '7',
        title: 'Workout',
        emoji: '💪',
        image: require('@/assets/images/Gym Dumbbell.png'),
    }
];

interface MoodItem {
    id: string;
    title: string;
    emoji: string;
    image: any;
}

const index = () => {
    const [isOnline, setIsOnline] = useState(true);
    const router = useRouter();
    const { setActiveMood } = useAudio();

    const handleMoodPress = (moodTitle: string) => {
        setActiveMood(moodTitle);
        router.push('/(tabs)/LibraryScreen');
    };

    const renderHeader = () => (
        <View>
            <View style={styles.header}>
                <TouchableOpacity>
                    <Ionicons name='menu' size={24} color='white' />
                </TouchableOpacity>

                <Text style={styles.title}>Vibe check</Text>

                <TouchableOpacity onPress={() => router.push('/SettingsScreen')}>
                    <Ionicons name='settings' size={24} color='white' />
                </TouchableOpacity>
            </View>

            <View style={styles.bodyContent}>
                <View style={styles.toggleContainer}>
                    <View style={styles.toggleWrapper}>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                !isOnline && styles.toggleButtonActive
                            ]}
                            onPress={() => setIsOnline(false)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="wifi-outline"
                                size={18}
                                color={!isOnline ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'}
                            />
                            <Text style={[
                                styles.toggleText,
                                !isOnline && styles.toggleTextActive
                            ]}>
                                Offline
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                isOnline && styles.toggleButtonActive
                            ]}
                            onPress={() => setIsOnline(true)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="wifi"
                                size={18}
                                color={isOnline ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'}
                            />
                            <Text style={[
                                styles.toggleText,
                                isOnline && styles.toggleTextActive
                            ]}>
                                Online
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.subTextHeader}>How are you feeling?</Text>
                    <Text style={styles.subText}>Select a vibe to start your mix.</Text>
                </View>
            </View>
        </View>
    );

    const renderFooter = () => (
        <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Can't find it? Tell us.</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Type your mood here..."
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    style={styles.input}
                />
                <TouchableOpacity style={styles.sendButton}>
                    <Ionicons name="arrow-forward" size={20} color={COLORS.textLight} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderMoodCard = ({ item }: { item: MoodItem }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => handleMoodPress(item.title)}
        >
            <ImageBackground
                source={item.image}
                style={styles.cardImage}
                imageStyle={{ borderRadius: 20 }}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.cardGradient}
                >
                    <View style={styles.cardContent}>
                        <Text style={styles.emoji}>{item.emoji}</Text>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </TouchableOpacity>
    );

    return (
        <View style={styles.mainContainer}>
            <FlatList
                data={MOODS}
                renderItem={renderMoodCard}
                keyExtractor={item => item.id}
                numColumns={2}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                contentContainerStyle={styles.listContainer}
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            />
        </View>
    )
}

export default index

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: COLORS.primaryDark,
    },
    listContainer: {
        paddingBottom: 40,
    },
    bodyContent: {
        marginBottom: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingTop: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textLight,
    },
    toggleContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignItems: 'center',
    },
    toggleWrapper: {
        flexDirection: 'row',
        backgroundColor: COLORS.toggleInactive,
        borderRadius: 12,
        padding: 4,
        width: '100%',
        maxWidth: 400,
    },
    toggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        gap: 8,
        backgroundColor: 'transparent',
    },
    toggleButtonActive: {
        backgroundColor: COLORS.toggleActive,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    toggleText: {
        fontSize: 15,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.5)',
    },
    toggleTextActive: {
        color: '#FFFFFF',
    },
    textContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    subTextHeader: {
        textAlign: 'center',
        fontSize: hp(3.5),
        fontWeight: '600',
        color: COLORS.textLight,
        marginBottom: 8,
    },
    subText: {
        textAlign: 'center',
        fontSize: hp(1.8),
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: 10,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_WIDTH,
        marginBottom: 15,
        borderRadius: 20,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    cardImage: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
    },
    cardGradient: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 12,
    },
    cardContent: {

    },
    emoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    footerContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        marginTop: 10,
    },
    footerText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: 15,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.toggleInactive,
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    input: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
        height: '100%',
    },
    sendButton: {
        backgroundColor: COLORS.toggleActive,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
})