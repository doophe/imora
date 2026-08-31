/**
 * AppSettingsModal — Uygulama Ayarları Modalı
 * Allows customization of Theme (Light / Dark / System) & preferences.
 */

import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeMode, useTheme } from '../context/ThemeContext';
import { CheckIcon, MoonIcon, SettingsIcon, SunIcon } from './NavIcons';

interface AppSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AppSettingsModal({ visible, onClose }: AppSettingsModalProps) {
  const insets = useSafeAreaInsets();
  const { themeMode, setThemeMode, colors, isDark } = useTheme();

  const [copyVibration, setCopyVibration] = useState(true);
  const [showImagePreview, setShowImagePreview] = useState(true);

  const THEME_OPTIONS: Array<{
    key: ThemeMode;
    label: string;
    sub: string;
    icon: (color: string) => React.ReactNode;
  }> = [
    {
      key: 'light',
      label: 'Açık Tema',
      sub: 'Aydınlık ve ferah görünüm',
      icon: (c) => <SunIcon color={c} size={20} />,
    },
    {
      key: 'dark',
      label: 'Koyu Tema',
      sub: 'Gözü yormayan şık gece modu',
      icon: (c) => <MoonIcon color={c} size={20} />,
    },
    {
      key: 'system',
      label: 'Sistem Tercihi',
      sub: 'Cihazınızın ayarlarına göre otomatik',
      icon: (c) => <SettingsIcon color={c} size={20} />,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View style={[styles.root, { backgroundColor: colors.bg }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: Platform.OS === 'ios' ? 18 : insets.top + 12,
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}>
          <View style={styles.headerLeft}>
            <View style={[styles.settingsCircle, { backgroundColor: colors.primaryLight }]}>
              <SettingsIcon color={colors.primary} size={18} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Uygulama Ayarları</Text>
              <Text style={[styles.headerSub, { color: colors.textSub }]}>Tema ve tercihler</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.surfaceSubtle }]}
            onPress={onClose}
            activeOpacity={0.7}>
            <Text style={[styles.closeBtnText, { color: colors.textSub }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}>
          {/* ── Section: Görünüm & Tema ────────────────────────────────────────── */}
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>GÖRÜNÜM & TEMA</Text>
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
            {THEME_OPTIONS.map((opt, idx) => {
              const isSelected = themeMode === opt.key;
              const isLast = idx === THEME_OPTIONS.length - 1;

              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.themeOptionRow,
                    !isLast && { borderBottomColor: colors.borderLight, borderBottomWidth: 1 },
                  ]}
                  onPress={() => setThemeMode(opt.key)}
                  activeOpacity={0.7}>
                  <View style={styles.themeOptionLeft}>
                    <View
                      style={[
                        styles.themeIconBox,
                        {
                          backgroundColor: isSelected
                            ? colors.primaryLight
                            : colors.surfaceSubtle,
                        },
                      ]}>
                      {opt.icon(isSelected ? colors.primary : colors.textSub)}
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.themeOptionLabel,
                          { color: isSelected ? colors.primary : colors.text },
                        ]}>
                        {opt.label}
                      </Text>
                      <Text style={[styles.themeOptionSub, { color: colors.textSub }]}>
                        {opt.sub}
                      </Text>
                    </View>
                  </View>

                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <CheckIcon color={colors.primary} size={18} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Section: Tercihler ────────────────────────────────────────────── */}
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>KULLANIM TERCİHLERİ</Text>
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
            <View style={[styles.preferenceRow, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}>
              <View style={styles.prefTextWrap}>
                <Text style={[styles.prefTitle, { color: colors.text }]}>Kopyalama Bildirimi</Text>
                <Text style={[styles.prefSub, { color: colors.textSub }]}>
                  Prompt kopyalandığında onay geri bildirimi ver
                </Text>
              </View>
              <Switch
                value={copyVibration}
                onValueChange={setCopyVibration}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.preferenceRow}>
              <View style={styles.prefTextWrap}>
                <Text style={[styles.prefTitle, { color: colors.text }]}>Görsel Önizlemeleri</Text>
                <Text style={[styles.prefSub, { color: colors.textSub }]}>
                  Kartlarda ve detayda yüksek çözünürlüklü görselleri yükle
                </Text>
              </View>
              <Switch
                value={showImagePreview}
                onValueChange={setShowImagePreview}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* ── Section: Hakkında ─────────────────────────────────────────────── */}
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>HAKKINDA</Text>
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
            <View style={[styles.infoRow, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>Uygulama Sürümü</Text>
              <Text style={[styles.infoValue, { color: colors.textSub }]}>Imora v1.0.0</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>Bulut Senkronizasyonu</Text>
              <View style={styles.cloudBadge}>
                <Text style={styles.cloudBadgeText}>Aktif &amp; Güvenli</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.infoRow}
              activeOpacity={0.7}
              onPress={() =>
                Alert.alert(
                  'Imora AI Prompt Library',
                  'Gelişmiş AI promptları, kategoriler ve özel kütüphane yönetimi platformu.\n\n© 2026 Imora\n\nGizlilik Politikamızı tarayıcınızda görüntülemek ister misiniz?',
                  [
                    {
                      text: 'Gizlilik Politikasını Aç',
                      onPress: () =>
                        Linking.openURL('https://doophe.github.io/imora/privacy-policy.html').catch(() => {}),
                    },
                    { text: 'Kapat', style: 'cancel' },
                  ]
                )
              }>
              <Text style={[styles.infoLabel, { color: colors.primary }]}>Lisans & Gizlilik Politikası</Text>
              <Text style={[styles.infoArrow, { color: colors.primary }]}>›</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 14,
    paddingHorizontal: 4,
  },
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 8,
  },
  themeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  themeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeOptionLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  themeOptionSub: {
    fontSize: 12,
    fontWeight: '400',
  },
  checkBadge: {
    paddingRight: 6,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  prefTextWrap: {
    flex: 1,
    paddingRight: 16,
  },
  prefTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  prefSub: {
    fontSize: 12,
    fontWeight: '400',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  infoArrow: {
    fontSize: 18,
    fontWeight: '700',
  },
  cloudBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  cloudBadgeText: {
    color: '#0284C7',
    fontSize: 11,
    fontWeight: '700',
  },
});
