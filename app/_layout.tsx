import { Toast } from "@/components/Toast";
import { useTheme } from "@/constants/theme";
import { PlaybackService } from "@/services/playbackService";
import { usePlayerStore } from "@/stores/playerStore";
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import TrackPlayer from "react-native-track-player";

SplashScreen.preventAutoHideAsync();
TrackPlayer.registerPlaybackService(() => PlaybackService);

const App = () => {
  const { colors, isDark } = useTheme();
  const { setupPlayer } = usePlayerStore();
  const isInitialized = useRef(false);

  // One job: set up the player once. Navigation is the user's responsibility.
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    setupPlayer().catch((e) => console.error("Player setup failed:", e));
  }, []);

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
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      <Stack.Screen
        name="player"
        options={{
          presentation: 'modal',
          gestureEnabled: true,
          gestureDirection: 'vertical',
          animationDuration: 400,
        }}
      />
    </Stack>
  );
}

export default App;
