import { COLORS } from "@/constants/theme";
import { AudioProvider } from "@/contexts/AudioContext";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import GlobalMiniPlayer from "../components/GlobalMiniPlayer";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AudioProvider>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
            <StatusBar />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: COLORS.primary },
                headerShown: false,
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="SettingsScreen" />
              <Stack.Screen
                name="PlayerModal"
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
            </Stack>
            <GlobalMiniPlayer />
          </SafeAreaView>
        </SafeAreaProvider>
      </AudioProvider>
    </GestureHandlerRootView>
  );
}
