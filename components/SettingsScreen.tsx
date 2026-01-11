import { COLORS } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native'

const SettingsScreen = () => {
    const router = useRouter();
    const [downloadWifiOnly, setDownloadWifiOnly] = useState(true);
    const [highQualityAudio, setHighQualityAudio] = useState(false);
    const [darkMode, setDarkMode] = useState(true);

    const renderSettingItem = (icon: any, title: string, showArrow = true, value?: boolean, onToggle?: (val: boolean) => void) => (
        <TouchableOpacity
            style={styles.settingItem}
            activeOpacity={0.7}
            disabled={value !== undefined}
        >
            <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.settingTitle}>{title}</Text>
            </View>

            {value !== undefined ? (
                <Switch
                    trackColor={{ false: COLORS.toggleInactive, true: COLORS.primary }}
                    thumbColor={'#FFFFFF'}
                    ios_backgroundColor={COLORS.toggleInactive}
                    onValueChange={onToggle}
                    value={value}
                />
            ) : (
                showArrow && <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textLight} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Account</Text>
                    {renderSettingItem('person-outline', 'Profile')}
                    {renderSettingItem('card-outline', 'Subscription Plan')}
                </View>

                {/* Playback Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Playback</Text>
                    {renderSettingItem('wifi-outline', 'Download over Wi-Fi only', false, downloadWifiOnly, setDownloadWifiOnly)}
                    {renderSettingItem('musical-notes-outline', 'High Quality Audio', false, highQualityAudio, setHighQualityAudio)}
                    {renderSettingItem('equalizer', 'Equalizer')}
                </View>

                {/* Appearance */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Appearance</Text>
                    {renderSettingItem('moon-outline', 'Dark Mode', false, darkMode, setDarkMode)}
                </View>

                {/* About */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>About</Text>
                    {renderSettingItem('information-circle-outline', 'Version 1.0.0', false)}
                    {renderSettingItem('document-text-outline', 'Privacy Policy')}
                </View>

                <TouchableOpacity style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <View style={{ height: 50 }} />
            </ScrollView>
        </View>
    )
}

export default SettingsScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: COLORS.backgroundDark, // or surfaceDark depending on desired look
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textLight,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.4)',
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        marginBottom: 5,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.toggleInactive,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingTitle: {
        fontSize: 16,
        color: COLORS.textLight,
        fontWeight: '500',
    },
    logoutButton: {
        marginTop: 10,
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 59, 48, 0.3)',
    },
    logoutText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: '600',
    },
})
