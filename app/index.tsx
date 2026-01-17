import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Fade in and scale animation for logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar animation
    const duration = 1200; // 1.2 seconds
    const interval = 30; // Update every 30ms
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(Math.floor(newProgress));

      Animated.timing(progressAnim, {
        toValue: newProgress,
        duration: interval,
        useNativeDriver: false,
      }).start();

      if (currentStep >= steps) {
        clearInterval(timer);
        // Navigate to tabs after completion
        setTimeout(() => {
          //@ts-ignore
          router.replace("/(tabs)");
        }, 300);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <ImageBackground
      source={require("@/assets/images/splash-screen-backround.png")}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Overlay for better text visibility */}
      <View style={styles.overlay} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo Container */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Image
              source={require("@/assets/images/sonique-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* App Name */}
        <Text style={styles.appName}>Sonique</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>FIND YOUR FREQUENCY</Text>
      </Animated.View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Loading Text with Progress */}
        <View style={styles.loadingTextContainer}>
          <Text style={styles.loadingText}>Tuning into your vibe...</Text>
          <Text style={styles.percentage}>{progress}%</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[styles.progressBar, { width: progressWidth }]}
          />
        </View>

        {/* Status Indicator */}
        <View style={styles.statusContainer}>
          <View style={styles.cloudIcon}>
            <Text style={styles.cloudEmoji}>☁️</Text>
          </View>
          <Text style={styles.statusText}>Offline & Online Mode Ready</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(108, 99, 255, 0.15)",
    borderWidth: 2,
    borderColor: "rgba(108, 99, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 90,
    height: 90,
  },
  appName: {
    fontSize: 48,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1,
    marginBottom: 8,
    textShadowColor: "rgba(108, 99, 255, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8B7FFF",
    letterSpacing: 3,
  },
  bottomSection: {
    paddingBottom: 60,
    paddingHorizontal: 30,
    width: "100%",
  },
  loadingTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "400",
  },
  percentage: {
    fontSize: 15,
    color: "#8B7FFF",
    fontWeight: "600",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "rgba(108, 99, 255, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 24,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#6C63FF",
    borderRadius: 3,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.6,
  },
  cloudIcon: {
    marginRight: 8,
  },
  cloudEmoji: {
    fontSize: 16,
  },
  statusText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "400",
  },
});
