/**
 * NotificationBanner
 * Luxury iOS / Dynamic Island style in-app push notification banner.
 * Displays Imora logo, notification title & message, and tap-to-open prompt action.
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { AppNotification } from '../services/notificationService';

interface Props {
  notification: AppNotification | null;
  onPress?: (notification: AppNotification) => void;
  onDismiss: () => void;
}

export const NotificationBanner: React.FC<Props> = ({
  notification,
  onPress,
  onDismiss,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const translateY = useRef(new Animated.Value(-160)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    if (notification) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // Slide in animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 6.5 seconds
      timeoutRef.current = setTimeout(() => {
        handleClose();
      }, 6500);
    } else {
      handleClose();
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [notification]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -160,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  // Swipe up to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy < -5,
      onPanResponderMove: (_, gs) => {
        if (gs.dy < 0) {
          translateY.setValue(gs.dy);
        }
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy < -30 || gs.vy < -0.6) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            tension: 100,
            friction: 10,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!notification) return null;

  const topOffset = insets.top > 0 ? insets.top + (Platform.OS === 'android' ? 8 : 4) : 16;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.container,
        {
          top: topOffset,
          transform: [{ translateY }],
          opacity,
        },
      ]}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          handleClose();
          onPress?.(notification);
        }}
        style={[
          styles.bannerCard,
          {
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
            shadowColor: isDark ? '#000000' : '#0F172A',
          },
        ]}>
        
        {/* App Logo Emblem */}
        <View style={styles.logoWrap}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />
        </View>

        {/* Text Content */}
        <View style={styles.contentWrap}>
          <View style={styles.headerRow}>
            <Text style={[styles.appName, { color: colors.primary }]}>IMORA</Text>
            <Text style={[styles.timeText, { color: colors.textMuted }]}>şimdi</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={[styles.message, { color: colors.textSub }]} numberOfLines={2}>
            {notification.message}
          </Text>
        </View>

        {/* Close Button */}
        <TouchableOpacity
          onPress={handleClose}
          style={styles.closeBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[styles.closeIcon, { color: colors.textMuted }]}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  logoWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#0096C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  logoImg: {
    width: 32,
    height: 32,
  },
  contentWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  appName: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '500',
    marginRight: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  closeBtn: {
    padding: 6,
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 13,
    fontWeight: '700',
  },
});
