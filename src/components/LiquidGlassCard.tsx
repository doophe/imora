/**
 * LiquidGlassCard — Imora AI Prompt Glass Card
 * Features:
 *  - 2-Column Responsive Dimensions
 *  - Liquid Glass bottom overlay
 *  - Favorite Heart Badge with Spring Pulse Animation
 *  - Micro-flash on tap
 */

import React, { useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { PromptItem } from '../types';
import { DocumentIcon, HeartIcon, SparklesIcon } from './NavIcons';

const { width: SCREEN_W } = Dimensions.get('window');
const H_PAD = 18;
const CARD_GAP = 14;
export const CARD_W = (SCREEN_W - H_PAD * 2 - CARD_GAP) / 2;
export const CARD_H = CARD_W * 1.35;

export interface LiquidGlassCardProps {
  item: PromptItem;
  isSaved?: boolean;
  onPress: (item: PromptItem) => void;
  onToggleSave?: (item: PromptItem) => void;
}

export default function LiquidGlassCard({
  item,
  isSaved,
  onPress,
  onToggleSave,
}: LiquidGlassCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const heartScaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 220, friction: 9, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    onPress(item);
  };

  const handleHeartPress = () => {
    Animated.sequence([
      Animated.timing(heartScaleAnim, { toValue: 1.4, duration: 110, useNativeDriver: true }),
      Animated.spring(heartScaleAnim, { toValue: 1, tension: 240, friction: 8, useNativeDriver: true }),
    ]).start();
    onToggleSave?.(item);
  };

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] });

  return (
    <Animated.View style={[styles.cardOuter, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={1} style={styles.cardTouch}>
        {item.imageSource ? (
          /* ─ Image card ─ */
          <View style={styles.cardGradient}>
            <Image
              source={item.imageSource}
              style={styles.cardImage}
              resizeMode="cover"
            />
            {/* Darken top so pills are readable */}
            <LinearGradient
              colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 0.4 }}
              style={styles.imageDarkTop}
            />
            {/* Darken bottom for glass panel */}
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 0, y: 1 }}
              style={styles.imageDarkBottom}
            />

            {/* Category pill */}
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText} numberOfLines={1}>
                {item.category}
              </Text>
            </View>

            {/* Favorite Heart Button */}
            <TouchableOpacity
              style={styles.cardHeartBtn}
              onPress={handleHeartPress}
              activeOpacity={0.8}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Animated.View
                style={[
                  styles.cardHeartBadge,
                  isSaved && styles.cardHeartBadgeSaved,
                  { transform: [{ scale: heartScaleAnim }] },
                ]}>
                <HeartIcon
                  color={isSaved ? '#EF4444' : '#FFFFFF'}
                  size={14}
                  filled={isSaved}
                />
              </Animated.View>
            </TouchableOpacity>

            {/* Liquid glass bottom panel */}
            <View style={styles.glassPanel}>
              <LinearGradient
                colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.glassSpecular}
              />
              <LinearGradient
                colors={['rgba(255,255,255,0.12)', 'rgba(0,0,0,0.35)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
              <View style={styles.copyRow}>
                <View style={styles.copyDot} />
                <Text style={styles.copyHint}>Detayları görüntüle</Text>
              </View>
            </View>

            {/* Flash */}
            <Animated.View style={[styles.flashOverlay, { opacity: glowOpacity }]}>
              <LinearGradient
                colors={['rgba(255,255,255,0.45)', 'rgba(255,255,255,0)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
        ) : (
          /* ─ Gradient card ─ */
          <LinearGradient
            colors={[item.gradient[0], item.gradient[1], '#000000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            locations={[0, 0.55, 1]}
            style={styles.cardGradient}
          >
            <View style={styles.noiseOverlay} />

            <LinearGradient
              colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.6, y: 0.6 }}
              style={styles.lightReflection}
            />

            <View style={styles.letterMark}>
              {item.id.startsWith('custom_') ? (
                <DocumentIcon color="#FFFFFF" size={14} />
              ) : (
                <SparklesIcon color="#FFFFFF" size={14} />
              )}
            </View>

            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText} numberOfLines={1}>
                {item.category}
              </Text>
            </View>

            {/* Favorite Heart Button */}
            <TouchableOpacity
              style={styles.cardHeartBtn}
              onPress={handleHeartPress}
              activeOpacity={0.8}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Animated.View
                style={[
                  styles.cardHeartBadge,
                  isSaved && styles.cardHeartBadgeSaved,
                  { transform: [{ scale: heartScaleAnim }] },
                ]}>
                <HeartIcon
                  color={isSaved ? '#EF4444' : '#FFFFFF'}
                  size={14}
                  filled={isSaved}
                />
              </Animated.View>
            </TouchableOpacity>

            <View style={styles.glassPanel}>
              <LinearGradient
                colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.glassSpecular}
              />

              <LinearGradient
                colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.06)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>

              <View style={styles.copyRow}>
                <View style={styles.copyDot} />
                <Text style={styles.copyHint}>Detayları görüntüle</Text>
              </View>
            </View>

            <Animated.View style={[styles.flashOverlay, { opacity: glowOpacity }]}>
              <LinearGradient
                colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </LinearGradient>
        )}
      </TouchableOpacity>

      <View style={styles.cardBorder} pointerEvents="none" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 24,
    backgroundColor: '#0F172A',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardTouch: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardBorder: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  cardGradient: {
    flex: 1,
    position: 'relative',
    justifyContent: 'space-between',
  },
  cardImage: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  imageDarkTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '40%',
  },
  imageDarkBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  noiseOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  lightReflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '60%',
  },
  letterMark: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterMarkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  categoryPill: {
    alignSelf: 'flex-start',
    margin: 12,
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  categoryPillText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  cardHeartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  cardHeartBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  cardHeartBadgeSaved: {
    backgroundColor: 'rgba(254, 226, 226, 0.95)',
    borderColor: '#EF4444',
  },
  glassPanel: {
    padding: 12,
    overflow: 'hidden',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  glassSpecular: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 1,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  copyDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#0096C7',
  },
  copyHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '500',
  },
  flashOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
