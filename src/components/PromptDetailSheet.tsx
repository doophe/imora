/**
 * PromptDetailSheet — Modern Light UI Bottom Sheet
 * Matches Imora aesthetic: clean white surface, deep teal accents, smooth drag-to-close
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Clipboard,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PromptItem } from '../types';
import { HeartIcon } from './NavIcons';

const { width: SW, height: SH } = Dimensions.get('window');

const SHEET_H = SH * 0.92;
const DRAG_CLOSE = SH * 0.20;
const PRIMARY_BLUE = '#0096C7';
const BLUE_DARK = '#0077B6';
const IMG_H = SW * 0.72;

interface Props {
  item: PromptItem | null;
  visible: boolean;
  onClose: () => void;
}

export default function PromptDetailSheet({ item, visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { toggleSavePrompt, isPromptSaved } = useAuth();

  const isSaved = item ? isPromptSaved(item.id) : false;

  const slideY = useRef(new Animated.Value(SHEET_H)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const copyScale = useRef(new Animated.Value(1)).current;

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  /* ── Open / Close ──────────────────────────────────────────────────────────*/
  useEffect(() => {
    if (visible) {
      dragY.setValue(0);
      setActiveImageIdx(0);
      setCopied(false);
      Animated.parallel([
        Animated.spring(slideY, { toValue: 0, tension: 68, friction: 12, useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 1, duration: 260, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideY, { toValue: SHEET_H, duration: 240, useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  /* ── Drag PanResponder ───────────────────────────────────────────────────*/
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        dragY.setValue(gs.dy);
        const ratio = Math.max(0, Math.min(1, 1 - gs.dy / (SHEET_H * 0.35)));
        backdrop.setValue(ratio);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > DRAG_CLOSE || gs.vy > 1.2) {
          Animated.parallel([
            Animated.timing(slideY, { toValue: SHEET_H, duration: 220, useNativeDriver: true }),
            Animated.timing(backdrop, { toValue: 0, duration: 180, useNativeDriver: true }),
          ]).start(() => { dragY.setValue(0); onClose(); });
        } else {
          Animated.parallel([
            Animated.spring(dragY, { toValue: 0, tension: 180, friction: 14, useNativeDriver: true }),
            Animated.timing(backdrop, { toValue: 1, duration: 180, useNativeDriver: true }),
          ]).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(dragY, { toValue: 0, tension: 180, friction: 14, useNativeDriver: true }).start();
      },
    }),
  ).current;

  /* ── AI Assistant Launcher (ChatGPT -> Gemini -> Web Fallback) ───────────*/
  const launchAiAssistant = async (promptText: string) => {
    const encoded = encodeURIComponent(promptText);

    // 1. Try ChatGPT Native App URL Scheme
    try {
      const canOpenChatGPT = await Linking.canOpenURL('chatgpt://');
      if (canOpenChatGPT) {
        await Linking.openURL(`chatgpt://prompt?q=${encoded}`);
        return;
      }
    } catch {
      // Continue to Gemini
    }

    // 2. Try Gemini Native App URL Scheme
    try {
      const canOpenGemini = await Linking.canOpenURL('gemini://');
      if (canOpenGemini) {
        await Linking.openURL('gemini://');
        return;
      }
    } catch {
      // Continue to Web Fallback
    }

    // 3. Fallback: Open ChatGPT Web or Gemini Web
    try {
      await Linking.openURL(`https://chatgpt.com/?hints=search&prompt=${encoded}`);
    } catch {
      try {
        await Linking.openURL('https://gemini.google.com/');
      } catch (err) {
        Alert.alert('Hata', 'Yapay zeka uygulaması veya tarayıcı açılamadı.');
      }
    }
  };

  /* ── Copy Prompt ──────────────────────────────────────────────────────────*/
  const handleCopy = () => {
    if (!item) return;
    Clipboard.setString(item.prompt);
    setCopied(true);
    Animated.sequence([
      Animated.timing(copyScale, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.spring(copyScale, { toValue: 1, tension: 220, friction: 9, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setCopied(false), 2400);

    // Show AI launch prompt alert
    Alert.alert(
      'Prompt Kopyalandı!',
      'Prompt panonuza kopyalandı.\n\nYapay zeka uygulamasını (ChatGPT / Gemini) açıp promptu hemen çalıştırmak ister misiniz?',
      [
        {
          text: 'Vazgeç',
          style: 'cancel',
        },
        {
          text: 'AI Uygulamasını Aç',
          onPress: () => {
            launchAiAssistant(item.prompt);
          },
        },
      ]
    );
  };

  if (!item) return null;

  /* ── Carousel Images ──────────────────────────────────────────────────────*/
  const hasComp = !!(item.beforeImage && item.afterImage);
  const pages: Array<{ key: string; label: string; source: any; isAfter: boolean }> =
    hasComp
      ? [
        { key: 'before', label: 'ÖNCE', source: item.beforeImage, isAfter: false },
        { key: 'after', label: 'SONRA', source: item.afterImage, isAfter: true },
      ]
      : item.imageSource
        ? [{ key: 'single', label: '', source: item.imageSource, isAfter: false }]
        : [];

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setActiveImageIdx(Math.round(e.nativeEvent.contentOffset.x / (SW - 40)));

  const bottomPad = insets.bottom > 0 ? insets.bottom + 12 : 20;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>

      <View style={s.root}>

        {/* Backdrop */}
        <Animated.View style={[s.backdrop, { opacity: backdrop }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* ── Sheet Content ──────────────────────────────────────────────── */}
        <Animated.View
          style={[
            s.sheet,
            {
              height: SHEET_H,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              transform: [{ translateY: Animated.add(slideY, dragY) }],
            },
          ]}>

          {/* ── Fixed Top Header Bar ────────────────────────────────────────── */}
          <View style={[s.topFixedBar, { borderBottomColor: colors.borderLight }]}>
            {/* Drag Handle */}
            <View {...pan.panHandlers} style={s.handleArea}>
              <View style={[s.handle, { backgroundColor: colors.border }]} />
            </View>

            {/* Actions Row (Favorite on Left, Category in Center, Close on Right) */}
            <View style={s.topNavRow}>
              <TouchableOpacity
                style={s.topActionBtn}
                onPress={() => item && toggleSavePrompt(item.id)}
                activeOpacity={0.7}>
                <View
                  style={[
                    s.topActionInner,
                    {
                      backgroundColor: isSaved
                        ? isDark
                          ? 'rgba(239, 68, 68, 0.2)'
                          : '#FEE2E2'
                        : colors.surfaceSubtle,
                    },
                  ]}>
                  <HeartIcon color={isSaved ? '#EF4444' : colors.textSub} size={18} filled={isSaved} />
                </View>
              </TouchableOpacity>

              <View style={[s.headerCatBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[s.headerCatText, { color: colors.primary }]}>
                  {item.category.toUpperCase()}
                </Text>
              </View>

              <TouchableOpacity style={s.topActionBtn} onPress={onClose} activeOpacity={0.7}>
                <View style={[s.topActionInner, { backgroundColor: colors.surfaceSubtle }]}>
                  <Text style={[s.closeBtnText, { color: colors.textSub }]}>✕</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Scrollable Body ──────────────────────────────────────────── */}
          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}>

            {/* Title */}
            <View style={s.titleBlock}>
              <Text style={[s.title, { color: colors.text }]}>{item.title}</Text>
            </View>

            {/* Tags */}
            <View style={s.tagsRow}>
              {item.tags.map(t => (
                <View
                  key={t}
                  style={[
                    s.tag,
                    {
                      backgroundColor: colors.surfaceSubtle,
                      borderColor: colors.border,
                    },
                  ]}>
                  <Text style={[s.tagText, { color: colors.textSub }]}>{t}</Text>
                </View>
              ))}
            </View>

            {/* Image Comparison Carousel */}
            {pages.length > 0 && (
              <View style={s.imgSection}>
                {hasComp && (
                  <View style={s.sectionHead}>
                    <View style={[s.sectionBar, { backgroundColor: colors.primary }]} />
                    <Text style={[s.sectionTitle, { color: colors.text }]}>Görsel Karşılaştırma</Text>
                    <Text style={[s.sectionHint, { color: colors.textMuted }]}>Kaydırarak inceleyin</Text>
                  </View>
                )}

                <FlatList
                  data={pages}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  bounces={false}
                  scrollEventThrottle={16}
                  onMomentumScrollEnd={onScrollEnd}
                  keyExtractor={p => p.key}
                  style={s.carousel}
                  renderItem={({ item: pg }) => (
                    <View style={s.imgPage}>
                      <Image source={pg.source} style={s.pageImg} resizeMode="cover" />
                      {hasComp && (
                        <View style={[s.imgLabel, pg.isAfter ? s.labelAfter : s.labelBefore]}>
                          <Text style={s.imgLabelText}>{pg.label}</Text>
                        </View>
                      )}
                    </View>
                  )}
                />

                {pages.length > 1 && (
                  <View style={s.dots}>
                    {pages.map((_, i) => (
                      <View
                        key={i}
                        style={[
                          s.dot,
                          i === activeImageIdx
                            ? [s.dotOn, { backgroundColor: colors.primary }]
                            : [s.dotOff, { backgroundColor: colors.border }],
                        ]}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Prompt Container */}
            <View
              style={[
                s.promptBlock,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                },
              ]}>
              <View style={s.promptHead}>
                <View style={[s.promptDot, { backgroundColor: colors.primary }]} />
                <Text style={[s.promptLabel, { color: colors.primary }]}>AI PROMPT</Text>
              </View>
              <Text style={[s.promptText, { color: colors.text }]}>{item.prompt}</Text>
            </View>

          </ScrollView>

          {/* ── Fixed Bottom Action Bar ──────────────────────────────────── */}
          <View style={[s.bottomBar, { paddingBottom: bottomPad }]}>
            <Animated.View style={{ transform: [{ scale: copyScale }] }}>
              <TouchableOpacity onPress={handleCopy} activeOpacity={0.85} style={s.copyBtn}>
                <LinearGradient
                  colors={copied ? ['#059669', '#047857'] : [PRIMARY_BLUE, BLUE_DARK]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.copyGrad}>
                  <Text style={s.copyIcon}>{copied ? '✓' : '⎘'}</Text>
                  <Text style={s.copyText}>{copied ? 'Prompt Kopyalandı!' : 'Promptu Kopyala'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

        </Animated.View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flexDirection: 'column',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: {
        elevation: 24,
      },
    }),
  },
  topFixedBar: {
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  handleArea: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 10,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  topActionBtn: {
    zIndex: 10,
  },
  topActionInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCatBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  headerCatText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },

  // Title Block
  titleBlock: {
    marginBottom: 14,
  },
  title: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 28,
  },

  // Tags
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '500',
  },

  // Image Carousel
  imgSection: {
    marginBottom: 20,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionBar: {
    width: 3,
    height: 16,
    borderRadius: 2,
    backgroundColor: PRIMARY_BLUE,
  },
  sectionTitle: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHint: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  carousel: {
    marginHorizontal: -20,
  },
  imgPage: {
    width: SW - 40,
    height: IMG_H,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  pageImg: {
    width: '100%',
    height: '100%',
  },
  imgLabel: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  labelBefore: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  labelAfter: {
    backgroundColor: PRIMARY_BLUE,
    left: undefined,
    right: 12,
  },
  imgLabelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    borderRadius: 4,
    height: 6,
  },
  dotOn: {
    width: 22,
    backgroundColor: PRIMARY_BLUE,
  },
  dotOff: {
    width: 6,
    backgroundColor: '#E2E8F0',
  },

  // Prompt Container
  promptBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    padding: 16,
    marginBottom: 10,
  },
  promptHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  promptDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PRIMARY_BLUE,
  },
  promptLabel: {
    color: PRIMARY_BLUE,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  promptText: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 22,
    fontWeight: '400',
  },

  // Bottom Action Bar
  bottomBar: {
    marginTop: -20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 10,
    borderTopColor: '#F1F5F9',
    marginBottom: -40,
  },
  copyBtn: {
    width: '100%',
    paddingBottom: 12,
    borderRadius: 18,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY_BLUE,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  copyGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    height: 96,
    borderRadius: 18,
  },
  copyIcon: {
    color: '#FFFFFF',
    fontSize: 21,
    paddingBottom: 34,
    fontWeight: '800',
  },
  copyText: {
    paddingBottom: 36,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
