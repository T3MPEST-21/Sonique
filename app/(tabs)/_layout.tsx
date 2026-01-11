import { COLORS } from '@/constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: COLORS.backgroundDark,
                    borderTopColor: 'rgba(108, 99, 255, 0.2)',
                    borderTopWidth: 1,
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.4)',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: '',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="LibraryScreen"
                options={{
                    title: '',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="musical-notes" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="PlaylistScreen"
                options={{
                    title: '',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="playlist-play" size={size + 5} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
