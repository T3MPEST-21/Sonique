# Add project specific ProGuard rules here.

# ─── React Native / Hermes ───────────────────────────────────────────────────
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-dontwarn com.facebook.**

# ─── react-native-reanimated ─────────────────────────────────────────────────
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# ─── react-native-track-player (CRITICAL — must not be stripped) ─────────────
-keep class com.doublesymmetry.trackplayer.** { *; }
-keep class com.doublesymmetry.trackplayer.model.** { *; }
-keep class com.doublesymmetry.trackplayer.service.** { *; }
-keep class com.doublesymmetry.trackplayer.module.** { *; }
-keep interface com.doublesymmetry.trackplayer.** { *; }
-dontwarn com.doublesymmetry.trackplayer.**

# ─── MMKV (Zustand persistence) ──────────────────────────────────────────────
-keep class com.tencent.mmkv.** { *; }
-dontwarn com.tencent.mmkv.**

# ─── Expo Modules ────────────────────────────────────────────────────────────
-keep class expo.modules.** { *; }
-dontwarn expo.modules.**

# ─── Kotlin Coroutines / Serialization ───────────────────────────────────────
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}
-keep class kotlin.coroutines.** { *; }
-dontwarn kotlin.**
-dontwarn kotlinx.**

# ─── General ─────────────────────────────────────────────────────────────────
# Keep native methods (used by React Native bridges)
-keepclassmembers class * {
    native <methods>;
}
# Keep BuildConfig so JS bundle feature gates still work
-keep class com.sonique.music.BuildConfig { *; }
