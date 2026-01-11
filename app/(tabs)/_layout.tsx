import { COLORS } from '@/constants/theme';
import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

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
                name="SettingScreen"    
                options={{
                    title: '',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
