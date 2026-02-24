import { useTheme } from "@/constants/theme";
import { PlaybackService } from "@/services/playbackService";
import { usePlayerStore } from "@/stores/playerStore";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { AppState, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import TrackPlayer from "react-native-track-player";

import { Toast } from "@/components/Toast";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

TrackPlayer.registerPlaybackService(() => PlaybackService);

const App = () => {
  const { colors, isDark } = useTheme();
  const { activeTrack, isPlaying, setupPlayer } = usePlayerStore();
  const router = useRouter();
  const hasNavigatedRef = useRef(false);
  const isInitialized = useRef(false);

  // Initialize Track Player
  useEffect(() => {
    const init = async () => {
      if (!isInitialized.current) {
        try {
          await setupPlayer();
          isInitialized.current = true;
          // Hide splash once service is ready
          setTimeout(() => SplashScreen.hideAsync(), 500);
        } catch (e) {
          console.error("Player setup failed", e);
          SplashScreen.hideAsync();
        }
      }
    };
    init();
  }, [setupPlayer]);

  // Handle redirection when app is opened/resumed with active playback
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && isPlaying && activeTrack && !hasNavigatedRef.current) {
        // Use replace to avoid stacking multiple modals on top of each other
        setTimeout(() => {
          router.replace('/player');
          hasNavigatedRef.current = true;
        }, 300);
      } else if (nextAppState !== 'active') {
        hasNavigatedRef.current = false;
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);

    // Initial check for cold start redirection
    if (isPlaying && activeTrack && !hasNavigatedRef.current) {
      const checkInterval = setInterval(() => {
        if (router) {
          router.replace('/player');
          hasNavigatedRef.current = true;
          clearInterval(checkInterval);
        }
      }, 500);

      setTimeout(() => clearInterval(checkInterval), 3000); // Guard
    }

    return () => sub.remove();
  }, [isPlaying, activeTrack]);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <RootNavigation />
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Toast />
      </View>
    </SafeAreaProvider>
  );
};

export function RootNavigation() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          animation: 'fade'
        }}
      />
      <Stack.Screen
        name="player"
        options={{
          presentation: 'modal',
          gestureEnabled: true,
          gestureDirection: 'vertical',
          animationDuration: 400,
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default App;
