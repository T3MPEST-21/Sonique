import { FloatingPlayer } from "@/components/FloatingPlayer";
import { useTheme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

const TabNav = () => {
  const { colors, fonts, isDark } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontSize: fonts.xs,
            fontWeight: "500",
          },
          tabBarStyle: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            position: "absolute",
            borderTopWidth: 0,
            paddingTop: 8,
            paddingBottom: 10,
            height: 60,
            backgroundColor: isDark ? "rgba(25, 25, 25, 0.98)" : "rgba(255, 255, 255, 0.98)",
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="(songs)"
          options={{
            title: "",
            tabBarIcon: ({ color }) => (
              <Ionicons name="musical-note" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="Playlists"
          options={{
            title: "",
            tabBarIcon: ({ color }) => (
              <Ionicons name="musical-notes" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="Artists"
          options={{
            title: "",
            tabBarIcon: ({ color }) => (
              <Ionicons name="person" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="Settings"
          options={{
            title: "",
            tabBarIcon: ({ color }) => (
              <Ionicons name="settings-outline" size={24} color={color} />
            ),
          }}
        />
      </Tabs>

      <FloatingPlayer />
    </View>
  );
};

export default TabNav;

const styles = StyleSheet.create({});
