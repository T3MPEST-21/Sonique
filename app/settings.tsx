import { useTheme } from '@/constants/theme';
import { BackgroundStyle, FontSizeScale, HapticLevel, ThemeMode, useThemeStore } from '@/stores/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACCENT_PRESETS = [
    '#fc3c44', // Apollo Red
    '#007AFF', // iOS Blue
    '#34C759', // iOS Green
    '#AF52DE', // iOS Purple
    '#FF9500', // iOS Orange
    '#5AC8FA', // iOS Teal
    '#FFCC00', // iOS Yellow
    '#00d2ff', // Cyber Blue
    '#9d50bb', // Purple Moon
];

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const { colors, fonts, cornerRadius, isDark } = useTheme();
    const theme = useThemeStore();

    const renderSection = (title: string, children: React.ReactNode) => (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted, fontSize: fonts.xs }]}>{title}</Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.backgroundLight, borderRadius: cornerRadius }]}>
                {children}
            </View>
        </View>
    );

    const renderRow = (label: string, valueLabel: string, onPress: () => void, icon?: string) => (
        <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
                {icon && <Ionicons name={icon as any} size={20} color={colors.primary} style={{ marginRight: 12 }} />}
                <Text style={[styles.rowLabel, { color: colors.text, fontSize: fonts.sm }]}>{label}</Text>
            </View>
            <View style={styles.rowRight}>
                <Text style={[styles.rowValue, { color: colors.textMuted, fontSize: fonts.sm }]}>{valueLabel}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text, fontSize: fonts.md }]}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Theme Mode */}
                {renderSection('APPEARANCE', (
                    <>
                        <View style={styles.item}>
                            <Text style={[styles.itemLabel, { color: colors.text, fontSize: fonts.sm }]}>Theme Mode</Text>
                            <View style={styles.segmentedControl}>
                                {(['light', 'dark', 'system'] as ThemeMode[]).map((m) => (
                                    <TouchableOpacity
                                        key={m}
                                        onPress={() => theme.updateTheme({ mode: m })}
                                        style={[
                                            styles.segment,
                                            theme.mode === m && { backgroundColor: colors.primary }
                                        ]}
                                    >
                                        <Text style={[
                                            styles.segmentText,
                                            { fontSize: fonts.xs },
                                            theme.mode === m ? { color: '#fff', fontWeight: '700' } : { color: colors.textMuted }
                                        ]}>
                                            {m.charAt(0).toUpperCase() + m.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </>
                ))}

                {/* Accent Color */}
                {renderSection('ACCENT COLOR', (
                    <View style={styles.colorGrid}>
                        {ACCENT_PRESETS.map((c) => (
                            <TouchableOpacity
                                key={c}
                                onPress={() => theme.updateTheme({ accentColor: c })}
                                style={[
                                    styles.colorCircle,
                                    { backgroundColor: c },
                                    theme.accentColor === c && { borderWidth: 3, borderColor: '#fff' }
                                ]}
                            />
                        ))}
                    </View>
                ))}

                {/* Background Style */}
                {renderSection('BACKGROUND STYLE', (
                    <>
                        {(['solid', 'glass', 'mesh'] as BackgroundStyle[]).map((s, i) => (
                            <TouchableOpacity
                                key={s}
                                style={[styles.row, i === 2 && { borderBottomWidth: 0 }]}
                                onPress={() => theme.updateTheme({ backgroundStyle: s })}
                            >
                                <Text style={[styles.rowLabel, { color: colors.text, fontSize: fonts.sm }]}>
                                    {s === 'solid' ? 'Solid Colors' : s === 'glass' ? 'Glassmorphism' : 'Mesh Gradients'}
                                </Text>
                                {theme.backgroundStyle === s && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                            </TouchableOpacity>
                        ))}
                        {theme.backgroundStyle === 'glass' && (
                            <View style={[styles.subRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                                <Text style={[styles.itemLabel, { color: colors.text, fontSize: fonts.sm }]}>Glass Intensity</Text>
                                <Text style={{ color: colors.textMuted }}>{(theme.glassIntensity * 100).toFixed(0)}%</Text>
                                {/* Slider would go here, using a simpler button for now due to Slider instability */}
                                <View style={styles.intensityControls}>
                                    <TouchableOpacity onPress={() => theme.updateTheme({ glassIntensity: Math.max(0, theme.glassIntensity - 0.1) })}>
                                        <Ionicons name="remove-circle-outline" size={24} color={colors.text} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => theme.updateTheme({ glassIntensity: Math.min(1, theme.glassIntensity + 0.1) })}>
                                        <Ionicons name="add-circle-outline" size={24} color={colors.text} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </>
                ))}

                {/* Typography */}
                {renderSection('TYPOGRAPHY', (
                    <View style={styles.segmentedControl}>
                        {(['small', 'medium', 'large'] as FontSizeScale[]).map((s) => (
                            <TouchableOpacity
                                key={s}
                                onPress={() => theme.updateTheme({ fontSizeScale: s })}
                                style={[
                                    styles.segment,
                                    theme.fontSizeScale === s && { backgroundColor: colors.primary }
                                ]}
                            >
                                <Text style={[
                                    styles.segmentText,
                                    { fontSize: fonts.xs },
                                    theme.fontSizeScale === s ? { color: '#fff', fontWeight: '700' } : { color: colors.textMuted }
                                ]}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}

                {/* Corner Radius */}
                {renderSection('UI STYLE', (
                    <View style={styles.subRow}>
                        <Text style={[styles.itemLabel, { color: colors.text, fontSize: fonts.sm }]}>Corner Rounding</Text>
                        <View style={styles.intensityControls}>
                            <TouchableOpacity onPress={() => theme.updateTheme({ cornerRadius: Math.max(0, theme.cornerRadius - 4) })}>
                                <Ionicons name="remove-circle-outline" size={24} color={colors.text} />
                            </TouchableOpacity>
                            <Text style={{ color: colors.text, marginHorizontal: 12 }}>{theme.cornerRadius}px</Text>
                            <TouchableOpacity onPress={() => theme.updateTheme({ cornerRadius: Math.min(40, theme.cornerRadius + 4) })}>
                                <Ionicons name="add-circle-outline" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                {/* Haptics */}
                {renderSection('FEEDBACK', (
                    <View style={styles.segmentedControl}>
                        {(['none', 'light', 'medium', 'heavy'] as HapticLevel[]).map((h) => (
                            <TouchableOpacity
                                key={h}
                                onPress={() => theme.updateTheme({ hapticLevel: h })}
                                style={[
                                    styles.segment,
                                    theme.hapticLevel === h && { backgroundColor: colors.primary }
                                ]}
                            >
                                <Text style={[
                                    styles.segmentText,
                                    { fontSize: fonts.xs },
                                    theme.hapticLevel === h ? { color: '#fff', fontWeight: '700' } : { color: colors.textMuted }
                                ]}>
                                    {h.charAt(0).toUpperCase() + h.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}


                <TouchableOpacity
                    style={[styles.resetBtn, { backgroundColor: colors.danger + '20' }]}
                    onPress={() => theme.resetToDefaults()}
                >
                    <Text style={[styles.resetBtnText, { color: colors.danger }]}>Reset to Defaults</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        justifyContent: 'space-between',
    },
    backBtn: { padding: 8 },
    headerTitle: { fontWeight: '700' },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
    section: { marginBottom: 24 },
    sectionTitle: { fontWeight: '600', marginBottom: 8, marginLeft: 4, letterSpacing: 1 },
    sectionContent: { overflow: 'hidden' },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center' },
    rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    rowLabel: { fontWeight: '500' },
    rowValue: { fontWeight: '400' },
    item: { padding: 16 },
    itemLabel: { marginBottom: 12, fontWeight: '500' },
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 8,
        padding: 2,
    },
    segment: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    segmentText: { fontWeight: '500' },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        padding: 16,
        justifyContent: 'center'
    },
    colorCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    subRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    intensityControls: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    toggle: {
        width: 44,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        position: 'relative',
    },
    toggleThumb: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        top: 2,
    },
    resetBtn: {
        marginTop: 20,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    resetBtnText: { fontWeight: '700' },
});
