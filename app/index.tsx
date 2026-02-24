import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { SoniqueLogo as SoniqueBrandingLogo } from '../components/SoniqueBrandingLogo';
import { useTheme } from '../constants/theme';
import { useSetupTrackPlayer } from '../hooks/useSetupTrackPlayer';
import { useLibraryStore } from '../stores/libraryStore';

const { width } = Dimensions.get('window');

export default function ManualSplash() {
    const { fetchTracks, loadFromCache, initialized: isLibraryReady } = useLibraryStore();
    const [isPlayerReady, setIsPlayerReady] = React.useState(false);
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const textAnim = React.useRef(new Animated.Value(0)).current;
    const { colors, fonts } = useTheme();

    useSetupTrackPlayer({
        onLoad: () => setIsPlayerReady(true)
    });

    useEffect(() => {
        // Fade in entire content
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();

        // Animate text entrance
        Animated.timing(textAnim, {
            toValue: 1,
            duration: 1500,
            delay: 500,
            useNativeDriver: true,
        }).start();

        // Trigger library initialization
        if (!isLibraryReady) loadFromCache();
        fetchTracks();
    }, []);

    useEffect(() => {
        if (isLibraryReady && isPlayerReady) {
            // Give it a moment to show the branding
            const timer = setTimeout(() => {
                SplashScreen.hideAsync();
                router.replace('/(tabs)/(songs)');
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [isLibraryReady, isPlayerReady]);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <SoniqueBrandingLogo size={140} color={colors.primary} />

                <Animated.View style={{
                    marginTop: 24,
                    opacity: textAnim,
                    transform: [{
                        translateY: textAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0]
                        })
                    }]
                }}>
                    <Text style={[styles.title, { color: colors.text }]}>SONIQUE</Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                        {isLibraryReady ? 'READY' : 'INITIALIZING LIBRARY...'}
                    </Text>
                </Animated.View>
            </Animated.View>

            <View style={styles.loaderContainer}>
                <Animated.View style={[
                    styles.loaderBar,
                    {
                        backgroundColor: colors.primary,
                        width: isLibraryReady ? width : width * 0.4
                    }
                ]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 4,
        marginTop: 8,
        textAlign: 'center',
        opacity: 0.6,
    },
    loaderContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    loaderBar: {
        height: '100%',
    }
});
