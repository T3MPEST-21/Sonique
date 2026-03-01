import { useTheme } from '@/constants/theme';
import { useLibraryStore } from '@/stores/libraryStore';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { SoniqueLogo as SoniqueBrandingLogo } from '../components/SoniqueBrandingLogo';

const { width } = Dimensions.get('window');

export default function ManualSplash() {
    const { loadFromCache, initialized: isLibraryReady } = useLibraryStore();
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const textAnim = React.useRef(new Animated.Value(0)).current;
    const progressAnim = React.useRef(new Animated.Value(0.4)).current;
    const hasNavigated = React.useRef(false);
    const { colors } = useTheme();

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();

        Animated.timing(textAnim, {
            toValue: 1,
            duration: 1500,
            delay: 500,
            useNativeDriver: true,
        }).start();

        // Load from cache immediately. If no cache (first install), scan once.
        if (!isLibraryReady) {
            loadFromCache();
        }
    }, []);

    useEffect(() => {
        if (isLibraryReady) {
            const timer = setTimeout(() => {
                SplashScreen.hideAsync();
                router.replace('/(tabs)/(songs)');
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isLibraryReady]);

    // Safety net — if cache is empty and first-time scan hasn't triggered
    useEffect(() => {
        const { tracks, fetchTracks: scan } = useLibraryStore.getState();
        if (tracks.length === 0) {
            scan(); // one-time fallback for first install
        }
    }, []);

    // Safety net: if library takes too long, navigate anyway after 6 seconds
    useEffect(() => {
        const fallback = setTimeout(() => {
            SplashScreen.hideAsync();
            router.replace('/(tabs)/(songs)');
            if (!hasNavigated.current) {
                hasNavigated.current = true;
                SplashScreen.hideAsync();
                router.replace('/(tabs)/(songs)');
            }
        }, 6000);
        return () => clearTimeout(fallback);
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: '#000000' }]}>
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
                        width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, width]
                        })
                    }
                ]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
