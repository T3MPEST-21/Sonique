import { COLORS } from '@/constants/theme';
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
                    title: 'Home',
                }}
            />
            <Tabs.Screen
                name="LibraryScreen"
                options={{
                    title: 'Library',
                }}
            />
            <Tabs.Screen
                name="SettingScreen"
                options={{
                    title: 'Settings',
                }}
            />
        </Tabs>
    );
}
