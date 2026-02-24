import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { useToastStore } from '@/stores/toastStore';
import { useTheme } from '@/constants/theme';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

export const Toast = () => {
    const { message, type, visible } = useToastStore();
    const { colors, fonts, cornerRadius, isDark } = useTheme();
    const opacity = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(opacity, {
                toValue: 1,
                useNativeDriver: true,
                tension: 40,
                friction: 7
            }).start();
        } else {
            Animated.timing(opacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    if (!message && !visible) return null;

    const iconName = type === 'success' ? 'checkmark-circle' : type === 'error' ? 'alert-circle' : 'information-circle';
    const iconColor = type === 'success' ? colors.primary : type === 'error' ? colors.danger : colors.text;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity,
                    transform: [{
                        translateY: opacity.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0]
                        })
                    }]
                }
            ]}
            pointerEvents="none"
        >
            <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={[styles.blur, { borderRadius: cornerRadius * 1.5 }]}>
                <View style={[styles.content, { borderColor: colors.border, borderRadius: cornerRadius * 1.5 }]}>
                    <Ionicons name={iconName} size={20} color={iconColor} />
                    <Text style={[styles.text, { color: colors.text, fontSize: fonts.sm }]}>{message}</Text>
                </View>
            </BlurView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 100,
        left: 24,
        right: 24,
        alignItems: 'center',
        zIndex: 10000,
    },
    blur: {
        overflow: 'hidden',
        width: '100%',
        maxWidth: 500,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        gap: 12,
        borderWidth: StyleSheet.hairlineWidth,
    },
    text: {
        fontWeight: '700',
        flex: 1,
    },
});
