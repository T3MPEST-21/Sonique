import { useTheme } from '@/constants/theme';
import { useLibraryStore } from '@/stores/libraryStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useThemeStore } from '@/stores/themeStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACCENT_COLORS = [
    '#fc3c44', // Apollo Red
    '#34c759', // Green
    '#007aff', // Blue
    '#af52de', // Purple
    '#ff9500', // Orange
    '#5856d6', // Indigo
];

const SLEEP_TIMER_OPTIONS = [15, 30, 45, 60];

export default function SettingsScreen() {
    const { colors, fonts, spacing, cornerRadius, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { tracks } = useLibraryStore();
    const { mode, accentColor, crossfadeEnabled, crossfadeDuration, updateTheme, resetToDefaults } = useThemeStore();
    const { sleepTimerEndsAt, setSleepTimer } = usePlayerStore();

    const [timeLeft, setTimeLeft] = useState<string | null>(null);

    // Countdown logic for Sleep Timer
    useEffect(() => {
        if (!sleepTimerEndsAt) {
            setTimeLeft(null);
            return;
        }

        const updateTimer = () => {
            const now = Date.now();
            const diff = sleepTimerEndsAt - now;

            if (diff <= 0) {
                setTimeLeft(null);
                return;
            }

            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [sleepTimerEndsAt]);

    const stats = useMemo(() => {
        const artistCounts: Record<string, number> = {};
        let totalDuration = 0;

        tracks.forEach(track => {
            if (track.artist && track.artist !== '<unknown>') {
                artistCounts[track.artist] = (artistCounts[track.artist] || 0) + 1;
            }
            totalDuration += (track.duration || 0);
        });

        const sortedArtists = Object.entries(artistCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        return {
            totalTracks: tracks.length,
            totalDuration: Math.round(totalDuration / 3600), // hours
            topArtists: sortedArtists,
        };
    }, [tracks]);

    const handleThemeChange = (newMode: 'light' | 'dark' | 'system') => {
        updateTheme({ mode: newMode });
    };

    const handleAccentChange = (color: string) => {
        updateTheme({ accentColor: color });
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={{ paddingTop: insets.top + spacing.vertical, paddingBottom: 120 }}
        >
            <Text style={[styles.header, { color: colors.text, paddingHorizontal: spacing.horizontal }]}>Settings & Insights</Text>

            {/* Insights Section */}
            <View style={[styles.section, { paddingHorizontal: spacing.horizontal }]}>
                <Text style={[styles.sectionTitle, { color: colors.textMuted, fontSize: fonts.xs }]}>LIBRARY INSIGHTS</Text>

                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card, borderRadius: cornerRadius }]}>
                        <Ionicons name="musical-notes-outline" size={24} color={colors.primary} />
                        <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalTracks}</Text>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Tracks</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card, borderRadius: cornerRadius }]}>
                        <Ionicons name="time-outline" size={24} color={colors.primary} />
                        <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalDuration}h</Text>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Playtime</Text>
                    </View>
                </View>

                {stats.topArtists.length > 0 && (
                    <View style={[styles.artistCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card, borderRadius: cornerRadius, marginTop: 12 }]}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>Top Artists</Text>
                        {stats.topArtists.map(([name, count], idx) => (
                            <View key={name} style={styles.artistItem}>
                                <Text style={[styles.artistName, { color: colors.text }]} numberOfLines={1}>{idx + 1}. {name}</Text>
                                <Text style={[styles.artistCount, { color: colors.textMuted }]}>{count} songs</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {/* Customization Section */}
            <View style={[styles.section, { paddingHorizontal: spacing.horizontal }]}>
                <Text style={[styles.sectionTitle, { color: colors.textMuted, fontSize: fonts.xs }]}>CUSTOMIZATION</Text>

                <View style={[styles.settingsList, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card, borderRadius: cornerRadius }]}>
                    {/* Theme Mode */}
                    <View style={styles.settingItem}>
                        <View style={styles.settingLabelContainer}>
                            <Ionicons name="moon-outline" size={20} color={colors.text} />
                            <Text style={[styles.settingLabel, { color: colors.text }]}>Appearance</Text>
                        </View>
                        <View style={styles.themeToggle}>
                            {(['light', 'dark', 'system'] as const).map((m) => (
                                <TouchableOpacity
                                    key={m}
                                    onPress={() => handleThemeChange(m)}
                                    style={[
                                        styles.toggleOption,
                                        mode === m && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                                    ]}
                                >
                                    <Text style={[
                                        styles.toggleText,
                                        { color: mode === m ? colors.primary : colors.textMuted, fontSize: fonts.xs }
                                    ]}>{m.charAt(0).toUpperCase() + m.slice(1)}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {/* Accent Color */}
                    <View style={styles.settingItemCol}>
                        <View style={styles.settingLabelContainer}>
                            <Ionicons name="color-palette-outline" size={20} color={colors.text} />
                            <Text style={[styles.settingLabel, { color: colors.text }]}>Accent Color</Text>
                        </View>
                        <View style={styles.colorGrid}>
                            {ACCENT_COLORS.map(color => (
                                <TouchableOpacity
                                    key={color}
                                    onPress={() => handleAccentChange(color)}
                                    style={[
                                        styles.colorCircle,
                                        { backgroundColor: color },
                                        accentColor === color && { borderColor: colors.text, borderWidth: 2 }
                                    ]}
                                />
                            ))}
                        </View>
                    </View>
                </View>
            </View>

            {/* Playback Section (Sleep Timer) */}
            <View style={[styles.section, { paddingHorizontal: spacing.horizontal }]}>
                <Text style={[styles.sectionTitle, { color: colors.textMuted, fontSize: fonts.xs }]}>PLAYBACK</Text>

                <View style={[styles.settingsList, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card, borderRadius: cornerRadius }]}>
                    <View style={styles.settingItemCol}>
                        <View style={styles.settingLabelContainer}>
                            <Ionicons name="timer-outline" size={20} color={colors.text} />
                            <Text style={[styles.settingLabel, { color: colors.text }]}>Sleep Timer</Text>
                            {timeLeft && (
                                <Text style={[styles.timerCountdown, { color: colors.primary, fontSize: fonts.xs }]}>
                                    Stop in {timeLeft}
                                </Text>
                            )}
                        </View>

                        <View style={styles.timerOptions}>
                            <TouchableOpacity
                                onPress={() => setSleepTimer(null)}
                                style={[styles.timerOption, !sleepTimerEndsAt && styles.timerOptionActive, { borderColor: colors.border }]}
                            >
                                <Text style={[styles.timerOptionText, { color: !sleepTimerEndsAt ? colors.primary : colors.text, fontSize: fonts.xs }]}>Off</Text>
                            </TouchableOpacity>
                            {SLEEP_TIMER_OPTIONS.map(mins => (
                                <TouchableOpacity
                                    key={mins}
                                    onPress={() => setSleepTimer(mins)}
                                    style={[styles.timerOption, { borderColor: colors.border }]}
                                >
                                    <Text style={[styles.timerOptionText, { color: colors.text, fontSize: fonts.xs }]}>{mins}m</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {/* Crossfade */}
                    <View style={styles.settingItemCol}>
                        <View style={[styles.settingLabelContainer, { justifyContent: 'space-between', flex: 1 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Ionicons name="swap-horizontal" size={20} color={colors.text} />
                                <Text style={[styles.settingLabel, { color: colors.text }]}>Crossfade</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.toggleBtn, crossfadeEnabled && { backgroundColor: colors.primary }]}
                                onPress={() => updateTheme({ crossfadeEnabled: !crossfadeEnabled })}
                            >
                                <View style={[styles.toggleKnob, crossfadeEnabled ? { transform: [{ translateX: 18 }] } : null]} />
                            </TouchableOpacity>
                        </View>

                        {crossfadeEnabled && (
                            <View style={styles.timerOptions}>
                                {[2, 4, 6, 8].map(sec => (
                                    <TouchableOpacity
                                        key={sec}
                                        onPress={() => updateTheme({ crossfadeDuration: sec })}
                                        style={[
                                            styles.timerOption,
                                            crossfadeDuration === sec && styles.timerOptionActive,
                                            { borderColor: colors.border }
                                        ]}
                                    >
                                        <Text style={[
                                            styles.timerOptionText,
                                            { color: crossfadeDuration === sec ? colors.primary : colors.text, fontSize: fonts.xs }
                                        ]}>{sec}s</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* About Section */}
            <View style={[styles.section, { paddingHorizontal: spacing.horizontal }]}>
                <Text style={[styles.sectionTitle, { color: colors.textMuted, fontSize: fonts.xs }]}>ABOUT</Text>

                <View style={[styles.settingsList, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card, borderRadius: cornerRadius, padding: 16 }]}>
                    <View style={{ alignItems: 'center', gap: 8 }}>
                        <Text style={[styles.aboutTitle, { color: colors.text }]}>Sonique</Text>
                        <Text style={[styles.version, { color: colors.textMuted }]}>Version 1.0.0 (Stable)</Text>
                        <Text style={[styles.aboutDescription, { color: colors.textMuted, fontSize: fonts.sm }]}>
                            A premium, high-performance music player designed for the ultimate listening experience.
                        </Text>
                        <View style={[styles.divider, { backgroundColor: colors.border, width: '100%', marginVertical: 8 }]} />
                        <Text style={[styles.creditText, { color: colors.textMuted, fontSize: fonts.xs }]}>
                            Crafted with precision & passion.
                        </Text>
                    </View>
                </View>
            </View>

            {/* Actions Section */}
            <View style={[styles.section, { paddingHorizontal: spacing.horizontal }]}>
                <Text style={[styles.sectionTitle, { color: colors.textMuted, fontSize: fonts.xs }]}>ADVANCED</Text>
                <TouchableOpacity
                    style={[styles.resetButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card, borderRadius: cornerRadius }]}
                    onPress={resetToDefaults}
                >
                    <Text style={[styles.resetText, { color: colors.danger }]}>Reset to Sonique Defaults</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.footer, { paddingHorizontal: spacing.horizontal }]}>
                <Text style={[styles.version, { color: colors.textMuted }]}>Sonique • Made with ❤️</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { fontSize: 32, fontWeight: '800', marginBottom: 24, marginTop: 10 },
    section: { marginBottom: 32 },
    sectionTitle: { fontWeight: '700', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
    statsGrid: { flexDirection: 'row', gap: 12 },
    statCard: { flex: 1, padding: 16, alignItems: 'center', gap: 4 },
    statValue: { fontSize: 22, fontWeight: '800' },
    statLabel: { fontSize: 12, fontWeight: '600' },
    artistCard: { padding: 16 },
    cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    artistItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
    artistName: { flex: 1, fontWeight: '600' },
    artistCount: { fontSize: 13 },
    settingsList: { overflow: 'hidden' },
    settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    settingItemCol: { padding: 16, gap: 16 },
    settingLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    settingLabel: { fontWeight: '600' },
    themeToggle: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 8, padding: 2 },
    toggleOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    toggleText: { fontWeight: '700' },
    colorGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    colorCircle: { width: 34, height: 34, borderRadius: 17 },
    divider: { height: 1, marginHorizontal: 16 },
    timerCountdown: { marginLeft: 'auto', fontWeight: '700' },
    timerOptions: { flexDirection: 'row', gap: 8 },
    timerOption: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, borderWidth: 1 },
    timerOptionActive: { backgroundColor: 'rgba(0,0,0,0.05)' },
    timerOptionText: { fontWeight: '700' },
    toggleBtn: { width: 44, height: 26, borderRadius: 13, backgroundColor: 'rgba(120,120,120,0.3)', justifyContent: 'center', padding: 2 },
    toggleKnob: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
    resetButton: { padding: 16, alignItems: 'center' },
    resetText: { fontWeight: '700' },
    footer: { alignItems: 'center', marginTop: 10 },
    version: { fontSize: 12, fontWeight: '500' },
    aboutTitle: { fontSize: 20, fontWeight: '800' },
    aboutDescription: { textAlign: 'center', lineHeight: 20 },
    creditText: { fontWeight: '600' },
});

