import { useSetupTrackPlayer } from "@/hooks/useSetupTrackPlayer";
import { PlaybackService } from "@/services/playbackService";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import TrackPlayer from "react-native-track-player";

TrackPlayer.registerPlaybackService(() => PlaybackService);

const App = () => {
  useSetupTrackPlayer({ onLoad: () => console.log("Player ready") });

  return (
    <SafeAreaProvider>
      <RootNavigation />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
};

export function RootNavigation() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="player"
        options={{
          presentation: 'card', // 'modal' allows swipe down but 'card' with gesture enabled is also fine. 
          // 'modal' on Android is a bit full screen. 
          // Let's stick to standard modal presentation or 'transparentModal' if we want the bottom sheet feel.
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
