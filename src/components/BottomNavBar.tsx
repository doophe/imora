/**
 * BottomNavBar — Modern Floating Bottom Navigation Bar
 * Features:
 *  - 100% Pixel-perfect tab alignment with 0px offset
 *  - Rich deep teal active color (#0D9488)
 *  - Animated spring sliding indicator
 *  - Uniform outline icons for all tabs (including Home)
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { BellIcon, HeartIcon, HomeIcon, ProfileIcon } from './NavIcons';

export type NavTab = 'home' | 'saved' | 'alerts' | 'profile';

interface BottomNavBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  unreadAlertsCount?: number;
}

const TABS: Array<{ key: NavTab; label: string; icon: (color: string) => React.ReactNode }> = [
  { key: 'home', label: 'Home', icon: (c) => <HomeIcon color={c} size={19} /> },
  { key: 'saved', label: 'Saved', icon: (c) => <HeartIcon color={c} size={19} filled={false} /> },
  { key: 'alerts', label: 'Alerts', icon: (c) => <BellIcon color={c} size={19} /> },
  { key: 'profile', label: 'Profile', icon: (c) => <ProfileIcon color={c} size={19} /> },
];

export default function BottomNavBar({ activeTab, onTabChange, unreadAlertsCount = 0 }: BottomNavBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const bottomInset = insets.bottom > 0 ? insets.bottom + 6 : 16;

  const [containerWidth, setContainerWidth] = useState(0);
  const activeIndex = TABS.findIndex(t => t.key === activeTab);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setContainerWidth(w);
    const tabW = w / TABS.length;
    slideAnim.setValue(activeIndex * tabW);
  };

  useEffect(() => {
    if (containerWidth > 0) {
      const tabW = containerWidth / TABS.length;
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: activeIndex * tabW,
          tension: 190,
          friction: 18,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 0.93, duration: 70, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 1, tension: 220, friction: 10, useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, [activeIndex, containerWidth]);

  const tabWidth = containerWidth > 0 ? containerWidth / TABS.length : 0;

  return (
    <View style={[styles.container, { bottom: bottomInset }]}>
      <View
        style={[
          styles.navPill,
          {
            backgroundColor: colors.navPillBg,
            borderColor: colors.navPillBorder,
          },
        ]}
        onLayout={handleLayout}>
        {/* ── Sliding Active Indicator ── */}
        {containerWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.slidingActiveIndicator,
              {
                width: tabWidth,
                transform: [
                  { translateX: slideAnim },
                  { scale: scaleAnim },
                ],
              },
            ]}>
            <View style={[styles.activeCircle, { backgroundColor: colors.primary }]} />
          </Animated.View>
        )}

        {/* ── 4 Full-Width Tab Slots ── */}
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          const color = isActive ? '#FFFFFF' : colors.textSub;
          const showAlertBadge = tab.key === 'alerts' && unreadAlertsCount > 0;

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.75}
              style={styles.tabButton}>
              <View style={styles.tabContent}>
                <View style={styles.iconWrap}>
                  {tab.icon(color)}
                  {showAlertBadge && (
                    <View
                      style={[
                        styles.badgeDot,
                        {
                          backgroundColor: isActive ? '#FFFFFF' : '#EF4444',
                          borderColor: isActive ? colors.primary : colors.navPillBg,
                        },
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    { color, fontWeight: isActive ? '700' : '500' },
                  ]}>
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 100,
  },
  navPill: {
    width: '100%',
    height: 74,
    backgroundColor: '#FFFFFF',
    borderRadius: 37,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0, // 0 padding ensures exact 25% width per tab slot
    borderWidth: 1,
    borderColor: '#EEF0F4',
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  slidingActiveIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  activeCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#0096C7',
    ...Platform.select({
      ios: {
        shadowColor: '#0096C7',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.5,
  },
  tabLabel: {
    fontSize: 10.5,
    letterSpacing: 0.2,
  },
});
