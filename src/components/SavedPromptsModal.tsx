/**
 * SavedPromptsModal — Kayıtlı Promptlar ve Özel Not Defteri Modalı
 * Displays:
 *  1. Favorited community prompts
 *  2. User's 100% private custom prompt notes
 * Allows creating new private notes without any sharing.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PROMPTS } from '../data/prompts';
import { customPromptService } from '../services/customPromptService';
import { PromptItem } from '../types';
import CreatePromptModal from './CreatePromptModal';
import LiquidGlassCard from './LiquidGlassCard';
import { DocumentIcon, HeartIcon, PlusIcon, SearchIcon, TrashIcon } from './NavIcons';
import PromptDetailSheet from './PromptDetailSheet';

const H_PAD = 18;
const CARD_GAP = 14;

interface SavedPromptsModalProps {
  visible: boolean;
  onClose: () => void;
  renderCard?: ({ item }: { item: PromptItem }) => React.ReactElement;
}

type TabFilter = 'all' | 'favorites' | 'custom';

export default function SavedPromptsModal({
  visible,
  onClose,
}: SavedPromptsModalProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user, savedPromptIds, isPromptSaved, toggleSavePrompt } = useAuth();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<TabFilter>('all');
  const [customPrompts, setCustomPrompts] = useState<PromptItem[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);

  // Load custom private notes whenever modal opens or user changes
  useEffect(() => {
    if (visible) {
      customPromptService.getCustomPrompts(user?.uid).then(setCustomPrompts);
    }
  }, [visible, user?.uid]);

  // Combine favorited library prompts + user private custom prompts
  const favoritedPrompts = useMemo(() => {
    return PROMPTS.filter(p => savedPromptIds.includes(p.id));
  }, [savedPromptIds]);

  const displayedList = useMemo(() => {
    let list: PromptItem[] = [];
    if (activeFilter === 'all') {
      list = [...customPrompts, ...favoritedPrompts];
    } else if (activeFilter === 'favorites') {
      list = favoritedPrompts;
    } else if (activeFilter === 'custom') {
      list = customPrompts;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q)) ||
          p.prompt.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeFilter, customPrompts, favoritedPrompts, search]);

  const handleCreatedCustomPrompt = (newPrompt: PromptItem) => {
    setCustomPrompts(prev => [newPrompt, ...prev]);
  };

  const handleDeleteCustomPrompt = async (promptId: string) => {
    Alert.alert('Notu Sil', 'Bu özel prompt notunu silmek istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          const updated = await customPromptService.deleteCustomPrompt(user?.uid, promptId);
          setCustomPrompts(updated);
        },
      },
    ]);
  };

  // Card renderer with tap-to-open detail support
  const renderItemCard = ({ item }: { item: PromptItem }) => {
    const isCustom = item.id.startsWith('custom_');

    return (
      <View style={styles.cardContainer}>
        <LiquidGlassCard
          item={item}
          isSaved={isPromptSaved(item.id)}
          onPress={(p) => {
            setSelectedPrompt(p);
          }}
          onToggleSave={(p) => toggleSavePrompt(p.id)}
        />
        {/* If custom note, show a small delete badge */}
        {isCustom && (
          <TouchableOpacity
            style={[styles.customDeleteBtn, { backgroundColor: colors.surface }]}
            onPress={() => handleDeleteCustomPrompt(item.id)}
            activeOpacity={0.7}>
            <TrashIcon color="#EF4444" size={13} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View style={[styles.root, { backgroundColor: colors.bg }]}>
        {/* Top Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: Platform.OS === 'ios' ? 16 : insets.top + 12,
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}>
          <View style={styles.headerLeft}>
            <View style={[styles.headerIconCircle, { backgroundColor: colors.surfaceSubtle }]}>
              <HeartIcon color={colors.text} size={16} filled={false} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Kayıtlı & Özel Notlar
              </Text>
              <Text style={[styles.headerSub, { color: colors.textSub }]}>
                {favoritedPrompts.length} favori • {customPrompts.length} özel not
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {/* New Private Note Button */}
            <TouchableOpacity
              style={[styles.addNoteBtn, { backgroundColor: colors.primary }]}
              onPress={() => setCreateModalOpen(true)}
              activeOpacity={0.8}>
              <PlusIcon color="#FFFFFF" size={14} />
              <Text style={styles.addNoteBtnText}>Yeni Not</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.surfaceSubtle }]}
              onPress={onClose}
              activeOpacity={0.7}>
              <Text style={[styles.closeBtnText, { color: colors.textSub }]}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Segment Tabs */}
        <View style={[styles.filterSegmentWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.segmentTab,
              activeFilter === 'all' && [styles.segmentTabActive, { backgroundColor: colors.primaryLight, borderColor: colors.primary }],
            ]}
            onPress={() => setActiveFilter('all')}
            activeOpacity={0.75}>
            <Text
              style={[
                styles.segmentTabText,
                { color: activeFilter === 'all' ? colors.primary : colors.textSub, fontWeight: activeFilter === 'all' ? '700' : '500' },
              ]}>
              Tümü ({customPrompts.length + favoritedPrompts.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentTab,
              activeFilter === 'custom' && [styles.segmentTabActive, { backgroundColor: colors.primaryLight, borderColor: colors.primary }],
            ]}
            onPress={() => setActiveFilter('custom')}
            activeOpacity={0.75}>
            <Text
              style={[
                styles.segmentTabText,
                { color: activeFilter === 'custom' ? colors.primary : colors.textSub, fontWeight: activeFilter === 'custom' ? '700' : '500' },
              ]}>
              Özel Notlarım ({customPrompts.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentTab,
              activeFilter === 'favorites' && [styles.segmentTabActive, { backgroundColor: colors.primaryLight, borderColor: colors.primary }],
            ]}
            onPress={() => setActiveFilter('favorites')}
            activeOpacity={0.75}>
            <Text
              style={[
                styles.segmentTabText,
                { color: activeFilter === 'favorites' ? colors.primary : colors.textSub, fontWeight: activeFilter === 'favorites' ? '700' : '500' },
              ]}>
              Favoriler ({favoritedPrompts.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search inside notes */}
        {(customPrompts.length > 0 || favoritedPrompts.length > 0) && (
          <View style={[styles.searchWrap, { paddingHorizontal: H_PAD }]}>
            <View
              style={[
                styles.searchBox,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}>
              <SearchIcon color={colors.textMuted} size={16} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Notlarda ve promptlarda ara..."
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Text style={{ color: colors.textMuted, fontSize: 13 }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Grid List */}
        <FlatList
          data={displayedList}
          keyExtractor={item => item.id}
          renderItem={renderItemCard}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {activeFilter === 'custom' ? (
                  <DocumentIcon color={colors.primary} size={30} />
                ) : (
                  <HeartIcon color="#EF4444" size={30} filled={false} />
                )}
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {search.trim()
                  ? 'Sonuç Bulunamadı'
                  : activeFilter === 'custom'
                    ? 'Henüz Özel Not Yok'
                    : 'Henüz Kayıtlı Prompt Yok'}
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.textSub }]}>
                {search.trim()
                  ? 'Aramanıza uygun not veya prompt bulunamadı.'
                  : activeFilter === 'custom'
                    ? '"Yeni Not" butonuna basarak sadece kendinize özel prompt notlarınızı oluşturabilirsiniz.'
                    : 'Prompt kartlarındaki kalp ikonuna basarak favorilerinizi buraya kaydedebilirsiniz.'}
              </Text>

              {activeFilter === 'custom' && !search.trim() && (
                <TouchableOpacity
                  style={[styles.emptyCreateBtn, { backgroundColor: colors.primary }]}
                  onPress={() => setCreateModalOpen(true)}
                  activeOpacity={0.85}>
                  <PlusIcon color="#FFFFFF" size={14} />
                  <Text style={styles.emptyCreateBtnText}>İlk Özel Notunu Ekle</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />

        {/* Create Private Prompt Modal */}
        <CreatePromptModal
          visible={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreated={handleCreatedCustomPrompt}
        />

        {/* Embedded Prompt Detail Sheet for seamless stacked modal */}
        <PromptDetailSheet
          item={selectedPrompt}
          visible={!!selectedPrompt}
          onClose={() => setSelectedPrompt(null)}
        />
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
    paddingHorizontal: H_PAD,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  addNoteBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
  filterSegmentWrap: {
    flexDirection: 'row',
    paddingHorizontal: H_PAD,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
  },
  segmentTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentTabActive: {},
  segmentTabText: {
    fontSize: 12,
  },
  searchWrap: {
    paddingTop: 12,
    paddingBottom: 6,
  },
  searchBox: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  listContent: {
    paddingTop: 14,
    paddingHorizontal: H_PAD,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },
  cardContainer: {
    position: 'relative',
  },
  customDeleteBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    zIndex: 10,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
  },
  emptyCreateBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
