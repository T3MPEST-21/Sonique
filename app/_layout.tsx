import { COLORS } from "@/constants/theme";
import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <StatusBar />
        <Stack screenOptions={{ headerStyle: { backgroundColor: COLORS.primary }, headerShown: false }} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
