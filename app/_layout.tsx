import { COLORS } from "@/constants/theme";
import { AudioProvider } from "@/contexts/AudioContext";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <AudioProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <StatusBar />
          <Stack screenOptions={{ headerStyle: { backgroundColor: COLORS.primary }, headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="SettingsScreen" />
            <Stack.Screen
              name="PlayerModal"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
          </Stack>
        </SafeAreaView>
      </SafeAreaProvider>
    </AudioProvider>
  );
}
