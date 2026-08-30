/**
 * CreatePromptModal — Kişisel Özel Prompt Notu Oluşturma Modalı
 * Kullanıcının kendine ait prompt notlarını girmesini sağlar.
 * 100% Gizli & Kişisel Not Defteri.
 */

import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { customPromptService } from '../services/customPromptService';
import { PromptItem } from '../types';
import { CheckIcon, DocumentIcon, PlusIcon } from './NavIcons';

interface CreatePromptModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: (newPrompt: PromptItem) => void;
}

const CATEGORY_CHIPS = ['Yazarlık', 'Kod', 'Görsel', 'İş', 'Pazarlama', 'Eğitim', 'Yaratıcı', 'Özel'];

export default function CreatePromptModal({
  visible,
  onClose,
  onCreated,
}: CreatePromptModalProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Yazarlık');
  const [promptText, setPromptText] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setTitle('');
    setCategory('Yazarlık');
    setPromptText('');
    setTagsText('');
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen prompt notunuz için bir başlık girin.');
      return;
    }
    if (!promptText.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen prompt metninizi yazın.');
      return;
    }

    try {
      setSaving(true);
      const parsedTags = tagsText
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);

      const created = await customPromptService.createCustomPrompt(user?.uid, {
        title,
        category,
        prompt: promptText,
        tags: parsedTags.length > 0 ? parsedTags : [category.toLowerCase()],
      });

      resetForm();
      onCreated(created);
      onClose();
    } catch (err) {
      console.warn('Error saving custom prompt', err);
      Alert.alert('Hata', 'Not kaydedilirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: colors.bg }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
              <DocumentIcon color={colors.primary} size={16} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Yeni Prompt Notu</Text>
              <Text style={[styles.headerSub, { color: colors.textSub }]}>Kişisel not defteriniz</Text>
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
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Privacy Info Banner */}
          <View
            style={[
              styles.privacyBanner,
              { backgroundColor: colors.primaryLight, borderColor: colors.primary },
            ]}>
            <Text style={[styles.privacyText, { color: colors.primaryDark }]}>
              Bu not sadece sizin cihazınızda ve hesabınızda saklanır. Hiçbir yerde paylaşılmaz.
            </Text>
          </View>

          {/* Form Fields */}
          <Text style={[styles.inputLabel, { color: colors.textSub }]}>PROMPT BAŞLIĞI *</Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Örn: YouTube Video Fikir Üretici"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={80}
          />

          <Text style={[styles.inputLabel, { color: colors.textSub }]}>KATEGORİ</Text>
          <View style={styles.chipsRow}>
            {CATEGORY_CHIPS.map(cat => {
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.75}>
                  <Text
                    style={[
                      styles.chipText,
                      { color: isSelected ? '#FFFFFF' : colors.textSub, fontWeight: isSelected ? '700' : '500' },
                    ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.inputLabel, { color: colors.textSub }]}>PROMPT METNİ / NOTLAR *</Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Yapay zekaya vereceğiniz prompt yönergesini buraya yazın..."
            placeholderTextColor={colors.textMuted}
            value={promptText}
            onChangeText={setPromptText}
            multiline
            textAlignVertical="top"
            numberOfLines={6}
          />

          <Text style={[styles.inputLabel, { color: colors.textSub }]}>ETİKETLER (İsteğe Bağlı, virgülle ayırın)</Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Örn: gpt-4, youtube, fikirler"
            placeholderTextColor={colors.textMuted}
            value={tagsText}
            onChangeText={setTagsText}
          />

          {/* Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}
              onPress={onClose}
              activeOpacity={0.75}>
              <Text style={[styles.cancelBtnText, { color: colors.textSub }]}>Vazgeç</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}>
              <Text style={styles.saveBtnText}>
                {saving ? 'Kaydediliyor...' : 'Notu Kaydet'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  privacyBanner: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  privacyText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 12,
  },
  textInput: {
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
  },
  textArea: {
    height: 140,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
