/**
 * SplashScreen — Premium Minimalist Light UI Splash Screen
 * Features:
 *  - High-end luxury typography and branding
 *  - Sleek deep teal progress indicator with smooth easing
 *  - Subtle ambient glow and micro-interactions
 *  - Seamless fade transition to the main interface
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SW, height: SH } = Dimensions.get('window');

const PRIMARY_BLUE = '#0096C7';
const BG_COLOR = '#F8F9FA';
const TEXT_DARK = '#0F172A';

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const insets = useSafeAreaInsets();

  /* ── Master Animation Values ──────────────────────────────────────────────*/
  const masterOpacity = useRef(new Animated.Value(0)).current;
  const masterScale   = useRef(new Animated.Value(0.95)).current;
  const logoSlideY    = useRef(new Animated.Value(20)).current;

  const progressAnim  = useRef(new Animated.Value(0)).current;
  const progressText  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrance animation
    Animated.parallel([
      Animated.timing(masterOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(masterScale, {
        toValue: 1,
        tension: 90,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.spring(logoSlideY, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Smooth loading progress
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1600,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start(() => {
      Animated.parallel([
        Animated.timing(masterOpacity, {
          toValue: 0,
          duration: 350,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(masterScale, {
          toValue: 1.04,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinish();
      });
    });

    const safetyTimer = setTimeout(() => {
      onFinish();
    }, 2400);

    return () => {
      clearTimeout(safetyTimer);
    };
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.root,
        {
          opacity: masterOpacity,
          transform: [{ scale: masterScale }],
        },
      ]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Center Content Block ── */}
      <Animated.View
        style={[
          styles.centerBlock,
          {
            transform: [{ translateY: logoSlideY }],
          },
        ]}>
        {/* Emblem Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.splashLogoImg}
            resizeMode="contain"
          />
        </View>

        {/* Brand Name */}
        <Text style={styles.brandTitle}>Imora</Text>
        <Text style={styles.brandTagline}>AI PROMPT STUDIO</Text>
      </Animated.View>

      {/* ── Bottom Loading Progress Bar ── */}
      <View style={[styles.bottomProgressWrap, { bottom: insets.bottom + 36 }]}>
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.loadingLabel}>Yükleniyor...</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: BG_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  centerBlock: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY_BLUE,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.28,
        shadowRadius: 18,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  splashLogoImg: {
    width: 88,
    height: 88,
    borderRadius: 24,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: TEXT_DARK,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  brandTagline: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 3,
  },

  // Bottom Loading Bar
  bottomProgressWrap: {
    position: 'absolute',
    alignItems: 'center',
    gap: 12,
  },
  progressBarTrack: {
    width: 160,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 2,
  },
  loadingLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
});
