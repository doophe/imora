import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES } from '../data/prompts';
import {
  BriefcaseIcon,
  ChartIcon,
  CodeIcon,
  FolderIcon,
  ImageIcon,
  PenIcon,
  SparklesIcon,
} from './NavIcons';

const { width, height } = Dimensions.get('window');
const DRAWER_W = Math.min(width * 0.78, 320);

const PRIMARY_BLUE = '#0096C7';
const BLUE_LIGHT = '#E0F4FB';
const TEXT_DARK = '#0F172A';

interface DrawerPanelProps {
  visible: boolean;
  onClose: () => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  totalCount: number;
}

const CATEGORY_ICONS: Record<string, (color: string) => React.ReactNode> = {
  'Tümü': (c) => <FolderIcon color={c} size={18} />,
  'Görsel': (c) => <ImageIcon color={c} size={18} />,
  'Yazarlık': (c) => <PenIcon color={c} size={18} />,
  'Kod': (c) => <CodeIcon color={c} size={18} />,
  'İş': (c) => <BriefcaseIcon color={c} size={18} />,
  'Pazarlama': (c) => <ChartIcon color={c} size={18} />,
  'Eğitim': (c) => <SparklesIcon color={c} size={18} />,
  'Yaratıcı': (c) => <SparklesIcon color={c} size={18} />,
  'Analiz': (c) => <ChartIcon color={c} size={18} />,
};

export default function DrawerPanel({
  visible,
  onClose,
  activeCategory,
  onSelectCategory,
  totalCount,
}: DrawerPanelProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [showModal, setShowModal] = useState(visible);

  const slideX = useRef(new Animated.Value(-DRAWER_W)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      slideX.setValue(-DRAWER_W);
      backdropOpacity.setValue(0);

      Animated.parallel([
        Animated.spring(slideX, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideX, {
          toValue: -DRAWER_W,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowModal(false);
      });
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideX, {
        toValue: -DRAWER_W,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowModal(false);
      onClose();
    });
  };

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}>
      <View style={styles.root}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        {/* Drawer Panel */}
        <Animated.View style={[styles.drawer, { transform: [{ translateX: slideX }] }]}>
          <View style={[styles.drawerBg, { backgroundColor: colors.surface }]}>
            {/* Header */}
            <View style={[styles.drawerHeader, { paddingTop: insets.top + (Platform.OS === 'android' ? 16 : 20) }]}>
              <View style={styles.headerTopRow}>
                <View style={[styles.headerAccent, { backgroundColor: colors.primary }]} />
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={handleClose}
                  activeOpacity={0.7}
                  hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
                  <View style={[styles.closeBtnInner, { backgroundColor: colors.surfaceSubtle }]}>
                    <Text style={[styles.closeBtnText, { color: colors.textSub }]}>✕</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <Text style={[styles.drawerTitle, { color: colors.text }]}>Kategoriler</Text>
              <Text style={[styles.drawerSub, { color: colors.textSub }]}>{totalCount} prompt listeleniyor</Text>
            </View>

            {/* Separator */}
            <View style={[styles.sep, { backgroundColor: colors.border }]} />

            {/* Category List */}
            <View style={styles.catList}>
              {CATEGORIES.map(cat => {
                const isActive = cat === activeCategory;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.catItem,
                      {
                        backgroundColor: isActive ? colors.primaryLight : colors.surfaceSubtle,
                        borderColor: isActive ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => {
                      onSelectCategory(cat);
                      handleClose();
                    }}
                    activeOpacity={0.75}>
                    <View
                      style={[
                        styles.catIconBox,
                        {
                          backgroundColor: colors.surface,
                        },
                      ]}>
                      {CATEGORY_ICONS[cat] ? (
                        CATEGORY_ICONS[cat](isActive ? colors.primary : colors.textSub)
                      ) : (
                        <FolderIcon color={isActive ? colors.primary : colors.textSub} size={18} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.catLabel,
                        {
                          color: isActive ? colors.primary : colors.text,
                          fontWeight: isActive ? '700' : '500',
                        },
                      ]}>
                      {cat}
                    </Text>
                    {isActive && (
                      <View style={[styles.activePill, { backgroundColor: colors.primary }]}>
                        <Text style={styles.activePillText}>Seçili</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Footer */}
            <View style={[styles.drawerFooter, { paddingBottom: insets.bottom + 20 }]}>
              <View style={[styles.footerAccent, { backgroundColor: colors.primary }]} />
              <Text style={[styles.footerBrand, { color: colors.text }]}>Imora</Text>
              <Text style={[styles.footerTagline, { color: colors.textMuted }]}>AI Prompt Studio</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  drawer: {
    width: DRAWER_W,
    height: height,
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 8, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  drawerBg: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },

  // Header
  drawerHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerAccent: {
    width: 32,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: PRIMARY_BLUE,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: TEXT_DARK,
    letterSpacing: -0.3,
  },
  drawerSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '700',
  },
  sep: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 20,
    marginBottom: 8,
  },

  // Categories
  catList: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  catItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginVertical: 4,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  catItemActive: {
    backgroundColor: BLUE_LIGHT,
    borderColor: PRIMARY_BLUE,
  },
  catIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  catIconBoxActive: {
    backgroundColor: '#FFFFFF',
  },
  catIcon: {
    fontSize: 16,
  },
  catLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  catLabelActive: {
    color: PRIMARY_BLUE,
    fontWeight: '700',
  },
  activePill: {
    backgroundColor: PRIMARY_BLUE,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // Footer
  drawerFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  footerAccent: {
    width: 24,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: PRIMARY_BLUE,
    marginBottom: 8,
  },
  footerBrand: {
    fontSize: 18,
    fontWeight: '800',
    color: TEXT_DARK,
    letterSpacing: -0.5,
  },
  footerTagline: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
});
