/**
 * LibraryScreen — Imora AI Prompt Kütüphanesi
 *
 * Modern UI with Cloud Firestore & Firebase Auth integration:
 *  - Top bar with Imora title on the left and circular avatar on the right (No hamburger)
 *  - High-performance Search bar + Category Filter button (fixed keyboard unmount bug)
 *  - 2-Column Grid of Liquid Glass Cards with Heart / Favorite Toggle
 *  - Saved Prompts Modal (Kayıtlı Promptlarım)
 *  - App Settings Modal with Light/Dark/System Theme Selection
 *  - Floating Pill Bottom Navigation Bar
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppSettingsModal from '../components/AppSettingsModal';
import BottomNavBar, { NavTab } from '../components/BottomNavBar';
import CreatePromptModal from '../components/CreatePromptModal';
import DrawerPanel from '../components/DrawerPanel';
import {
  BellIcon,
  CameraIcon,
  ChevronRightIcon,
  ClockIcon,
  DocumentIcon,
  FilterIcon,
  HeartIcon,
  HelpCircleIcon,
  LogoutIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  TrashIcon,
} from '../components/NavIcons';
import LiquidGlassCard from '../components/LiquidGlassCard';
import { NotificationBanner } from '../components/NotificationBanner';
import PromptDetailSheet from '../components/PromptDetailSheet';
import SavedPromptsModal from '../components/SavedPromptsModal';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import notifee, { EventType } from '@notifee/react-native';
import { CATEGORIES, PROMPTS } from '../data/prompts';
import { customPromptService } from '../services/customPromptService';
import { AppNotification, notificationService } from '../services/notificationService';
import { PromptItem } from '../types';

const H_PAD = 18;
const CARD_GAP = 14;

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 1) return 'Az önce';
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Dün';
  return `${days} gün önce`;
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
interface LibraryScreenProps {
  onLogout?: () => void;
}

export default function LibraryScreen({ onLogout }: LibraryScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { user, savedPromptIds, signOut, deleteAccount, toggleSavePrompt, isPromptSaved, updateProfilePhoto } = useAuth();
  const [updatingPhoto, setUpdatingPhoto] = useState(false);

  const [selectedItem, setSelectedItem] = useState<PromptItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savedPromptsOpen, setSavedPromptsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const searchInputRef = useRef<TextInput>(null);

  // Saved / Custom Prompts Tab State
  const [customPrompts, setCustomPrompts] = useState<PromptItem[]>([]);
  const [createNoteModalOpen, setCreateNoteModalOpen] = useState(false);
  const [savedFilter, setSavedFilter] = useState<'all' | 'custom' | 'favorites'>('all');
  const [savedSearch, setSavedSearch] = useState('');

  // ── In-App Notifications State ─────────────────────────────────────────────
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeBannerNotif, setActiveBannerNotif] = useState<AppNotification | null>(null);

  // ── Guest 30-Day Expiry Countdown ──────────────────────────────────────────
  const [guestCountdown, setGuestCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    isExpired: boolean;
  }>({ days: 30, hours: 0, minutes: 0, isExpired: false });

  useEffect(() => {
    if (user?.provider !== 'guest') return;

    const calc = () => {
      const created = user.createdAt || Date.now();
      const expiresAt = created + 30 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      const diff = Math.max(0, expiresAt - now);

      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

      setGuestCountdown({
        days,
        hours,
        minutes,
        isExpired: diff <= 0,
      });
    };

    calc();
    const interval = setInterval(calc, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user?.provider, user?.createdAt]);

  // Load custom private notes whenever activeTab or user changes
  useEffect(() => {
    customPromptService.getCustomPrompts(user?.uid).then(setCustomPrompts);
  }, [user?.uid, activeTab]);

  // Load notifications, request OS permission & check for new prompts to show phone push notification
  useEffect(() => {
    // 1. Request OS System Notification Permission
    notificationService.requestSystemPermission();

    // 2. Schedule OS background reminders (Space exploration, Creative prompts, etc.)
    notificationService.scheduleSystemReminders();

    // 3. Load stored notifications & check for new prompts
    notificationService.getNotifications().then(setNotifications);

    notificationService.checkForNewPrompts(PROMPTS).then(newNotif => {
      if (newNotif) {
        setActiveBannerNotif(newNotif);
        notificationService.getNotifications().then(setNotifications);
      }
    });

    // 4. Handle OS System Notification Press when user taps notification on their lock screen / status bar
    const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS && detail.notification?.data?.promptId) {
        const pId = detail.notification.data.promptId as string;
        const found = PROMPTS.find(p => p.id === pId);
        if (found) {
          setSelectedItem(found);
        }
      }
    });

    // 5. Check if app was opened directly from a system notification
    notifee.getInitialNotification().then(initial => {
      if (initial?.notification?.data?.promptId) {
        const pId = initial.notification.data.promptId as string;
        const found = PROMPTS.find(p => p.id === pId);
        if (found) {
          setSelectedItem(found);
        }
      }
    });

    return () => {
      unsubscribeNotifee();
    };
  }, []);

  const handleOpenNotificationPrompt = async (notif: AppNotification) => {
    const updated = await notificationService.markAsRead(notif.id);
    setNotifications(updated);

    if (notif.promptId) {
      const found = PROMPTS.find(p => p.id === notif.promptId);
      if (found) {
        setSelectedItem(found);
      }
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    const updated = await notificationService.markAllAsRead();
    setNotifications(updated);
  };

  const favoritedPrompts = useMemo(() => {
    return PROMPTS.filter(p => savedPromptIds.includes(p.id));
  }, [savedPromptIds]);

  const displayedSavedList = useMemo(() => {
    let list: PromptItem[] = [];
    if (savedFilter === 'all') {
      list = [...customPrompts, ...favoritedPrompts];
    } else if (savedFilter === 'favorites') {
      list = favoritedPrompts;
    } else if (savedFilter === 'custom') {
      list = customPrompts;
    }

    if (savedSearch.trim()) {
      const q = savedSearch.toLowerCase();
      list = list.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q)) ||
          p.prompt.toLowerCase().includes(q),
      );
    }
    return list;
  }, [savedFilter, customPrompts, favoritedPrompts, savedSearch]);

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

  // Tab screen fade animation
  const screenFadeAnim = useRef(new Animated.Value(1)).current;

  const filtered = useMemo(() => {
    let list = PROMPTS;
    if (activeCategory !== 'Tümü') {
      list = list.filter(p => p.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [activeCategory, search]);

  const handleTabChange = (tab: NavTab) => {
    if (tab === activeTab) return;

    // Cross-fade animation between tabs
    Animated.sequence([
      Animated.timing(screenFadeAnim, { toValue: 0.3, duration: 90, useNativeDriver: true }),
      Animated.timing(screenFadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();

    setActiveTab(tab);
  };

  const handleEditProfilePhoto = () => {
    const options = ['Fotoğraf Çek', 'Galeriden Seç', 'Varsayılan Fotoğrafa Dön', 'İptal'];
    const cancelButtonIndex = 3;
    const destructiveButtonIndex = 2;

    const onPickImage = async (buttonIndex: number) => {
      if (buttonIndex === 0) {
        try {
          setUpdatingPhoto(true);
          const res = await launchCamera({
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 800,
            maxHeight: 800,
            saveToPhotos: true,
          });
          if (res.assets && res.assets[0]?.uri) {
            await updateProfilePhoto(res.assets[0].uri);
          }
        } catch (err) {
          console.warn('Camera error:', err);
        } finally {
          setUpdatingPhoto(false);
        }
      } else if (buttonIndex === 1) {
        try {
          setUpdatingPhoto(true);
          const res = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 800,
            maxHeight: 800,
          });
          if (res.assets && res.assets[0]?.uri) {
            await updateProfilePhoto(res.assets[0].uri);
          }
        } catch (err) {
          console.warn('Gallery error:', err);
        } finally {
          setUpdatingPhoto(false);
        }
      } else if (buttonIndex === 2) {
        setUpdatingPhoto(true);
        try {
          await updateProfilePhoto('');
        } finally {
          setUpdatingPhoto(false);
        }
      }
    };

    if (Platform.OS === 'ios' && ActionSheetIOS) {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
          title: 'Profil Fotoğrafını Düzenle',
          message: 'Yeni bir profil fotoğrafı belirleyin veya varsayılana dönün.',
        },
        onPickImage
      );
    } else {
      Alert.alert('Profil Fotoğrafını Düzenle', 'Bir seçenek belirleyin:', [
        { text: 'Fotoğraf Çek', onPress: () => onPickImage(0) },
        { text: 'Galeriden Seç', onPress: () => onPickImage(1) },
        { text: 'Varsayılana Dön', style: 'destructive', onPress: () => onPickImage(2) },
        { text: 'İptal', style: 'cancel' },
      ]);
    }
  };

  const handleLogoutAction = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            onLogout?.();
          },
        },
      ]
    );
  };

  const handleDeleteAccountAction = () => {
    Alert.alert(
      'Hesabı ve Verileri Sil',
      'Hesabınızı, kaydedilen tüm promptlarınızı ve size özel yerel notlarınızı kalıcı olarak silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Kalıcı Olarak Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              Alert.alert('Hesabınız Silindi', 'Hesabınız ve ilişkili tüm verileriniz başarıyla kalıcı olarak silindi.');
              onLogout?.();
            } catch (err: any) {
              Alert.alert('Hata', err?.message || 'Hesap silinirken bir sorun oluştu. Lütfen tekrar deneyin.');
            }
          },
        },
      ]
    );
  };

  const renderCard = ({ item }: { item: PromptItem }) => (
    <LiquidGlassCard
      item={item}
      isSaved={isPromptSaved(item.id)}
      onPress={setSelectedItem}
      onToggleSave={(p) => toggleSavePrompt(p.id)}
    />
  );

  // ── Render Header Element (Stable JSX to prevent remounting search input) ───
  const renderListHeader = () => (
    <View style={styles.listHeader}>
      {/* Search & Filter Row */}
      <View style={styles.searchRow}>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <SearchIcon color={colors.textMuted} size={18} />
          <TextInput
            ref={searchInputRef}
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Projelerde ara..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              activeOpacity={0.7}
              style={styles.clearSearchBtn}>
              <Text style={[styles.clearSearchText, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Button */}
        <TouchableOpacity
          style={[
            styles.filterBtn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setDrawerOpen(true)}
          activeOpacity={0.8}>
          <FilterIcon color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Active category pill (if not Tümü) */}
      {activeCategory !== 'Tümü' && (
        <View style={styles.activeCatRow}>
          <View style={[styles.activeCatBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.activeCatText, { color: colors.primary }]}>{activeCategory}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setActiveCategory('Tümü')}
            style={styles.clearCatBtn}
            activeOpacity={0.7}>
            <Text style={[styles.clearCatText, { color: colors.textSub }]}>Tümünü Göster ✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // ── Empty State ─────────────────────────────────────────────────────────────
  const renderListEmpty = () => (
    <View style={styles.empty}>
      <View style={[styles.emptyIconCircle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <SearchIcon color={colors.textMuted} size={28} />
      </View>
      <Text style={[styles.emptyText, { color: colors.text }]}>Sonuç bulunamadı</Text>
      <Text style={[styles.emptySub, { color: colors.textSub }]}>Farklı bir arama terimi veya kategori dene</Text>
    </View>
  );

  // ── Saved Item Card Renderer ───────────────────────────────────────────────
  const renderSavedCard = ({ item }: { item: PromptItem }) => {
    const isCustom = item.id.startsWith('custom_');

    return (
      <View style={styles.savedCardContainer}>
        <LiquidGlassCard
          item={item}
          isSaved={isPromptSaved(item.id)}
          onPress={setSelectedItem}
          onToggleSave={(p) => toggleSavePrompt(p.id)}
        />
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

  // ── Placeholder Screens for Saved, Alerts, Profile Tabs ────────────────────
  const renderTabContent = () => {
    if (activeTab === 'home') {
      return (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={renderCard}
          numColumns={2}
          columnWrapperStyle={styles.row}
          ListHeaderComponent={renderListHeader()}
          ListEmptyComponent={renderListEmpty()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
        />
      );
    }

    if (activeTab === 'saved') {
      return (
        <View style={[styles.savedTabRoot, { paddingBottom: insets.bottom + 100 }]}>
          {/* Top Saved Header Bar */}
          <View style={[styles.savedHeaderRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.savedHeaderTitle, { color: colors.text }]}>Kayıtlı & Özel Notlar</Text>
              <Text style={[styles.savedHeaderSub, { color: colors.textSub }]}>
                {favoritedPrompts.length} favori • {customPrompts.length} özel not
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.addNoteBtn, { backgroundColor: colors.primary }]}
              onPress={() => setCreateNoteModalOpen(true)}
              activeOpacity={0.85}>
              <PlusIcon color="#FFFFFF" size={14} />
              <Text style={styles.addNoteBtnText}>Yeni Not</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Segment Tabs */}
          <View style={[styles.savedSegmentWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.savedSegmentTab,
                savedFilter === 'all' && [styles.savedSegmentTabActive, { backgroundColor: colors.primaryLight, borderColor: colors.primary }],
              ]}
              onPress={() => setSavedFilter('all')}
              activeOpacity={0.75}>
              <Text
                style={[
                  styles.savedSegmentText,
                  { color: savedFilter === 'all' ? colors.primary : colors.textSub, fontWeight: savedFilter === 'all' ? '700' : '500' },
                ]}>
                Tümü ({customPrompts.length + favoritedPrompts.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.savedSegmentTab,
                savedFilter === 'custom' && [styles.savedSegmentTabActive, { backgroundColor: colors.primaryLight, borderColor: colors.primary }],
              ]}
              onPress={() => setSavedFilter('custom')}
              activeOpacity={0.75}>
              <Text
                style={[
                  styles.savedSegmentText,
                  { color: savedFilter === 'custom' ? colors.primary : colors.textSub, fontWeight: savedFilter === 'custom' ? '700' : '500' },
                ]}>
                Özel Notlarım ({customPrompts.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.savedSegmentTab,
                savedFilter === 'favorites' && [styles.savedSegmentTabActive, { backgroundColor: colors.primaryLight, borderColor: colors.primary }],
              ]}
              onPress={() => setSavedFilter('favorites')}
              activeOpacity={0.75}>
              <Text
                style={[
                  styles.savedSegmentText,
                  { color: savedFilter === 'favorites' ? colors.primary : colors.textSub, fontWeight: savedFilter === 'favorites' ? '700' : '500' },
                ]}>
                Favoriler ({favoritedPrompts.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search inside saved items */}
          {(customPrompts.length > 0 || favoritedPrompts.length > 0) && (
            <View style={[styles.savedSearchWrap, { paddingHorizontal: H_PAD }]}>
              <View
                style={[
                  styles.savedSearchBox,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}>
                <SearchIcon color={colors.textMuted} size={16} />
                <TextInput
                  style={[styles.savedSearchInput, { color: colors.text }]}
                  placeholder="Kayıtlılarda ve notlarda ara..."
                  placeholderTextColor={colors.textMuted}
                  value={savedSearch}
                  onChangeText={setSavedSearch}
                />
                {savedSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setSavedSearch('')}>
                    <Text style={{ color: colors.textMuted, fontSize: 13 }}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* FlatList */}
          <FlatList
            data={displayedSavedList}
            keyExtractor={item => item.id}
            renderItem={renderSavedCard}
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.savedListContent}
            ListEmptyComponent={
              <View style={styles.savedEmptyWrap}>
                <View style={[styles.emptyIconCircle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {savedFilter === 'custom' ? (
                    <DocumentIcon color={colors.primary} size={30} />
                  ) : (
                    <HeartIcon color="#EF4444" size={30} filled={false} />
                  )}
                </View>
                <Text style={[styles.emptyText, { color: colors.text }]}>
                  {savedSearch.trim()
                    ? 'Sonuç Bulunamadı'
                    : savedFilter === 'custom'
                      ? 'Henüz Özel Not Yok'
                      : 'Henüz Kayıtlı Prompt Yok'}
                </Text>
                <Text style={[styles.emptySub, { color: colors.textSub }]}>
                  {savedSearch.trim()
                    ? 'Aramanıza uygun kayıtlı prompt veya özel not bulunamadı.'
                    : savedFilter === 'custom'
                      ? 'Kendinize ait prompt notlarını "Yeni Not" butonuna dokunarak oluşturabilirsiniz.'
                      : 'Beğendiğiniz promptları üzerlerindeki kalp butonuna dokunarak kaydedebilirsiniz.'}
                </Text>
                {savedFilter === 'custom' && !savedSearch.trim() && (
                  <TouchableOpacity
                    style={[styles.emptyCreateBtn, { backgroundColor: colors.primary }]}
                    onPress={() => setCreateNoteModalOpen(true)}
                    activeOpacity={0.85}>
                    <PlusIcon color="#FFFFFF" size={14} />
                    <Text style={styles.emptyCreateBtnText}>İlk Özel Notunu Ekle</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        </View>
      );
    }

    if (activeTab === 'alerts') {
      const unreadAlerts = notifications.filter(n => !n.read).length;

      return (
        <ScrollView
          style={styles.alertsScrollView}
          contentContainerStyle={[
            styles.alertsScrollContent,
            { paddingBottom: insets.bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}>

          {/* ── Alerts Top Header Card ── */}
          <View
            style={[
              styles.alertsHeaderCard,
              { backgroundColor: colors.cardBg, borderColor: colors.border },
            ]}>
            <View style={styles.alertsHeaderLeft}>
              <View
                style={[
                  styles.alertsHeaderIconBox,
                  { backgroundColor: colors.primaryLight },
                ]}>
                <BellIcon color={colors.primary} size={22} />
              </View>
              <View>
                <Text style={[styles.alertsHeaderTitle, { color: colors.text }]}>
                  Bildirim Merkezi
                </Text>
                <Text style={[styles.alertsHeaderSubtitle, { color: colors.textSub }]}>
                  {unreadAlerts > 0
                    ? `${unreadAlerts} yeni okunmamış bildirim`
                    : 'Tüm bildirimler güncel'}
                </Text>
              </View>
            </View>

            {unreadAlerts > 0 && (
              <TouchableOpacity
                onPress={handleMarkAllNotificationsRead}
                activeOpacity={0.7}
                style={[styles.markAllReadBtn, { backgroundColor: colors.surfaceSubtle }]}>
                <Text style={[styles.markAllReadText, { color: colors.primary }]}>
                  Tümünü Oku
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Notifications List ── */}
          {notifications.length === 0 ? (
            <View style={styles.alertsEmptyWrap}>
              <View
                style={[
                  styles.placeholderIconBox,
                  { backgroundColor: colors.primaryLight },
                ]}>
                <BellIcon color={colors.primary} size={32} />
              </View>
              <Text style={[styles.placeholderTitle, { color: colors.text }]}>
                Henüz Bildirim Yok
              </Text>
              <Text style={[styles.placeholderDesc, { color: colors.textSub }]}>
                Yeni eklenen promptlar ve ilham verici hatırlatmalar burada listelenecektir.
              </Text>
            </View>
          ) : (
            <View style={styles.notificationsList}>
              {notifications.map((item) => {
                const isNewCard = item.type === 'new_card';
                const isReminder = item.type === 'reminder';

                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleOpenNotificationPrompt(item)}
                    activeOpacity={0.78}
                    style={[
                      styles.notifCard,
                      {
                        backgroundColor: colors.cardBg,
                        borderColor: item.read ? colors.border : colors.primary,
                        borderWidth: item.read ? 1 : 1.5,
                      },
                    ]}>
                    <View style={styles.notifCardInner}>
                      {/* Icon */}
                      <View
                        style={[
                          styles.notifIconBox,
                          {
                            backgroundColor: isNewCard
                              ? colors.primaryLight
                              : isReminder
                              ? '#FEF3C7'
                              : colors.surfaceSubtle,
                          },
                        ]}>
                        <Text style={styles.notifEmoji}>
                          {isNewCard ? '✨' : isReminder ? '🌌' : '🔔'}
                        </Text>
                      </View>

                      {/* Content */}
                      <View style={styles.notifTextWrap}>
                        <View style={styles.notifTopRow}>
                          <Text
                            style={[
                              styles.notifTitle,
                              { color: colors.text, fontWeight: item.read ? '600' : '800' },
                            ]}
                            numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={[styles.notifTime, { color: colors.textMuted }]}>
                            {formatRelativeTime(item.timestamp)}
                          </Text>
                        </View>
                        <Text
                          style={[styles.notifMsg, { color: colors.textSub }]}
                          numberOfLines={2}>
                          {item.message}
                        </Text>

                        {/* Action CTA for prompt cards */}
                        {item.promptId && (
                          <View style={styles.notifActionRow}>
                            <Text style={[styles.notifActionText, { color: colors.primary }]}>
                              Promptu Gör & Kopyala ›
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Unread Indicator Dot */}
                      {!item.read && (
                        <View
                          style={[
                            styles.notifUnreadDot,
                            { backgroundColor: colors.primary },
                          ]}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      );
    }

    if (activeTab === 'profile') {
      const providerLabel =
        user?.provider === 'google'
          ? 'GOOGLE İLE BAĞLI'
          : user?.provider === 'guest'
            ? 'MİSAFİR HESABI'
            : 'E-POSTA İLE BAĞLI';

      return (
        <ScrollView
          style={styles.profileScrollView}
          contentContainerStyle={[
            styles.profileScrollContent,
            { paddingBottom: insets.bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={true}>
          <View style={[styles.profileHeaderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              onPress={handleEditProfilePhoto}
              activeOpacity={0.8}
              style={styles.profileAvatarWrap}>
              <UserAvatar
                photoURL={user?.photoURL}
                name={user?.displayName}
                size={88}
                isGuest={user?.provider === 'guest'}
              />
              <View style={[styles.editAvatarBadge, { backgroundColor: colors.primary }]}>
                <CameraIcon color="#FFFFFF" size={13} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleEditProfilePhoto}
              activeOpacity={0.7}
              style={[styles.changePhotoBtn, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.changePhotoBtnText, { color: colors.primary }]}>
                {updatingPhoto ? 'Güncelleniyor...' : 'Fotoğrafı Düzenle'}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.profileName, { color: colors.text }]}>{user?.displayName || 'Kullanıcı'}</Text>
            {user?.email ? <Text style={[styles.profileEmail, { color: colors.textSub }]}>{user.email}</Text> : null}
            <View style={[styles.proBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.proBadgeText, { color: colors.primary }]}>{providerLabel}</Text>
            </View>
          </View>

          <View style={styles.profileStatsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statNumber, { color: colors.text }]}>{PROMPTS.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSub }]}>Prompt</Text>
            </View>
            <TouchableOpacity
              style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleTabChange('saved')}
              activeOpacity={0.8}>
              <Text style={[styles.statNumber, { color: '#EF4444' }]}>{savedPromptIds.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSub }]}>Kayıtlı</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleTabChange('saved')}
              activeOpacity={0.8}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>{customPrompts.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSub }]}>Özel Not</Text>
            </TouchableOpacity>
          </View>

          {/* ── Guest 30-Day Expiry Countdown Card ── */}
          {user?.provider === 'guest' && (
            <View style={[styles.guestCountdownCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.countdownHead}>
                <View style={[styles.countdownIconWrap, { backgroundColor: isDark ? 'rgba(217, 119, 6, 0.2)' : '#FEF3C7' }]}>
                  <ClockIcon color="#D97706" size={16} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.countdownTitle, { color: colors.text }]}>Geçici Misafir Hesabı</Text>
                  <Text style={[styles.countdownSubtitle, { color: colors.textSub }]}>
                    İlk girişten itibaren 30 gün içinde hesap silinir.
                  </Text>
                </View>
              </View>

              <View style={styles.countdownBadgesRow}>
                <View style={[styles.countdownBadge, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
                  <Text style={[styles.countdownBadgeNumber, { color: colors.primary }]}>{guestCountdown.days}</Text>
                  <Text style={[styles.countdownBadgeLabel, { color: colors.textSub }]}>GÜN</Text>
                </View>
                <Text style={[styles.countdownColon, { color: colors.textMuted }]}>:</Text>
                <View style={[styles.countdownBadge, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
                  <Text style={[styles.countdownBadgeNumber, { color: colors.primary }]}>{String(guestCountdown.hours).padStart(2, '0')}</Text>
                  <Text style={[styles.countdownBadgeLabel, { color: colors.textSub }]}>SAAT</Text>
                </View>
                <Text style={[styles.countdownColon, { color: colors.textMuted }]}>:</Text>
                <View style={[styles.countdownBadge, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
                  <Text style={[styles.countdownBadgeNumber, { color: colors.primary }]}>{String(guestCountdown.minutes).padStart(2, '0')}</Text>
                  <Text style={[styles.countdownBadgeLabel, { color: colors.textSub }]}>DAKİKA</Text>
                </View>
              </View>

              <Text style={[styles.countdownNotice, { color: colors.textSub }]}>
                Kayıtlı promptlarınızı ve özel notlarınızı kaybetmemek için dilediğiniz zaman kalıcı bir hesap oluşturabilirsiniz.
              </Text>
            </View>
          )}

          <View style={[styles.profileMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.profileMenuItem, { borderBottomColor: colors.borderLight }]}
              onPress={() => handleTabChange('saved')}
              activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconCircle, { backgroundColor: colors.surfaceSubtle }]}>
                  <HeartIcon color={colors.text} size={18} filled={false} />
                </View>
                <Text style={[styles.profileMenuText, { color: colors.text }]}>
                  Kayıtlı Promptlarım ({savedPromptIds.length})
                </Text>
              </View>
              <ChevronRightIcon color={colors.textMuted} size={15} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.profileMenuItem, { borderBottomColor: colors.borderLight }]}
              onPress={() => setSettingsOpen(true)}
              activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconCircle, { backgroundColor: colors.surfaceSubtle }]}>
                  <SettingsIcon color={colors.text} size={18} />
                </View>
                <Text style={[styles.profileMenuText, { color: colors.text }]}>
                  Uygulama Ayarları
                </Text>
              </View>
              <ChevronRightIcon color={colors.textMuted} size={15} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.profileMenuItem, { borderBottomColor: colors.borderLight }]}
              onPress={() =>
                Alert.alert(
                  'Yardım & Destek',
                  'Imora AI hakkında sorularınız, geri bildirimleriniz ve önerileriniz için efeyalcindag0@gmail.com adresine e-posta gönderebilirsiniz.',
                  [
                    {
                      text: 'E-posta Gönder',
                      onPress: () => Linking.openURL('mailto:efeyalcindag0@gmail.com').catch(() => {}),
                    },
                    { text: 'Tamam', style: 'cancel' },
                  ]
                )
              }
              activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconCircle, { backgroundColor: colors.surfaceSubtle }]}>
                  <HelpCircleIcon color={colors.text} size={18} />
                </View>
                <Text style={[styles.profileMenuText, { color: colors.text }]}>
                  Yardım & Destek
                </Text>
              </View>
              <ChevronRightIcon color={colors.textMuted} size={15} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.profileMenuItem, { borderBottomColor: colors.borderLight }]}
              onPress={handleLogoutAction}
              activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconCircle, { backgroundColor: colors.surfaceSubtle }]}>
                  <LogoutIcon color={colors.text} size={18} />
                </View>
                <Text style={[styles.profileMenuText, { color: colors.text }]}>Çıkış Yap</Text>
              </View>
              <ChevronRightIcon color={colors.textMuted} size={15} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.profileMenuItem, { borderBottomWidth: 0 }]}
              onPress={handleDeleteAccountAction}
              activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconCircle, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2' }]}>
                  <TrashIcon color="#EF4444" size={18} />
                </View>
                <Text style={[styles.profileMenuText, { color: '#EF4444', fontWeight: '600' }]}>
                  Hesabımı ve Verilerimi Sil
                </Text>
              </View>
              <ChevronRightIcon color="#EF4444" size={15} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }

    return null;
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor="transparent" translucent />

      {/* ── Top Header Bar (Imora title on Left, Avatar on Right) ───────────── */}
      <View
        style={[
          styles.topHeader,
          {
            paddingTop: insets.top + (Platform.OS === 'android' ? 12 : 8),
            backgroundColor: colors.bg,
          },
        ]}>
        {/* Imora Title shifted to the left */}
        <TouchableOpacity onPress={() => handleTabChange('home')} activeOpacity={0.8}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Imora</Text>
        </TouchableOpacity>

        {/* Profile Avatar */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleTabChange('profile')}
          style={[styles.avatarWrap, { borderColor: colors.border }]}>
          <UserAvatar
            photoURL={user?.photoURL}
            name={user?.displayName}
            size={36}
            isGuest={user?.provider === 'guest'}
          />
        </TouchableOpacity>
      </View>

      {/* ── Tab Content Area with Smooth Fade ──────────────────────────────── */}
      <Animated.View style={[styles.mainContentArea, { opacity: screenFadeAnim }]}>
        {renderTabContent()}
      </Animated.View>

      {/* ── Top Notification Banner ────────────────────────────────────────── */}
      <NotificationBanner
        notification={activeBannerNotif}
        onPress={(notif) => {
          handleOpenNotificationPrompt(notif);
          setActiveBannerNotif(null);
        }}
        onDismiss={() => setActiveBannerNotif(null)}
      />

      {/* ── Floating Bottom Navigation Bar ─────────────────────────────────── */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        unreadAlertsCount={notifications.filter(n => !n.read).length}
      />

      {/* ── Category Filter Drawer (Triggered by Filter Button) ─────────────── */}
      <DrawerPanel
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setActiveTab('home');
        }}
        totalCount={PROMPTS.length}
      />

      {/* ── Prompt Detail Bottom Sheet ─────────────────────────────────────── */}
      <PromptDetailSheet
        item={selectedItem}
        visible={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      {/* ── Saved Prompts Modal ────────────────────────────────────────────── */}
      <SavedPromptsModal
        visible={savedPromptsOpen}
        onClose={() => setSavedPromptsOpen(false)}
      />

      {/* ── Create Private Prompt Note Modal ───────────────────────────────── */}
      <CreatePromptModal
        visible={createNoteModalOpen}
        onClose={() => setCreateNoteModalOpen(false)}
        onCreated={(newPrompt) => setCustomPrompts(prev => [newPrompt, ...prev])}
      />

      {/* ── App Settings Modal ─────────────────────────────────────────────── */}
      <AppSettingsModal
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  // ── Saved Tab Styles ────────────────────────────────────────────────────────
  savedTabRoot: {
    flex: 1,
  },
  savedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PAD,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  savedHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  savedHeaderSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
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
  savedSegmentWrap: {
    flexDirection: 'row',
    paddingHorizontal: H_PAD,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
  },
  savedSegmentTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  savedSegmentTabActive: {},
  savedSegmentText: {
    fontSize: 12,
  },
  savedSearchWrap: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  savedSearchBox: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  savedSearchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  savedListContent: {
    paddingTop: 14,
  },
  savedCardContainer: {
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
  savedEmptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
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
  mainContentArea: {
    flex: 1,
  },

  // ── Top Header ──────────────────────────────────────────────────────────────
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PAD,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  // ── Search & Filter ─────────────────────────────────────────────────────────
  listHeader: {
    paddingHorizontal: H_PAD,
    paddingTop: 8,
    paddingBottom: 14,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBox: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontWeight: '500',
    padding: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },
  clearSearchText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterBtn: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  // ── Active Category ─────────────────────────────────────────────────────────
  activeCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  activeCatBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  activeCatText: {
    fontSize: 12,
    fontWeight: '700',
  },
  clearCatBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearCatText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // ── Grid ────────────────────────────────────────────────────────────────────
  listContent: {
    paddingTop: 4,
  },
  row: {
    paddingHorizontal: H_PAD,
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },

  // ── Empty ───────────────────────────────────────────────────────────────────
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },

  // ── Alerts & Notification Center ──────────────────────────────────────────
  alertsScrollView: {
    flex: 1,
  },
  alertsScrollContent: {
    paddingHorizontal: H_PAD,
    paddingTop: 8,
  },
  alertsHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  alertsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertsHeaderIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertsHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  alertsHeaderSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  markAllReadBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  markAllReadText: {
    fontSize: 12,
    fontWeight: '700',
  },
  alertsEmptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  notificationsList: {
    gap: 12,
  },
  notifCard: {
    borderRadius: 18,
    padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  notifCardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  notifIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  notifEmoji: {
    fontSize: 18,
  },
  notifTextWrap: {
    flex: 1,
  },
  notifTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  notifTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  notifMsg: {
    fontSize: 13,
    lineHeight: 18,
  },
  notifActionRow: {
    marginTop: 8,
  },
  notifActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  notifUnreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },

  // ── Placeholder Tab Screens (Search, Profile) ───────────────────────
  placeholderContainer: {
    flex: 1,
    paddingHorizontal: H_PAD,
  },
  placeholderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: 40,
  },
  placeholderIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },

  // Profile View
  profileScrollView: {
    flex: 1,
  },
  profileScrollContent: {
    paddingHorizontal: H_PAD,
    paddingTop: 4,
  },
  profileHeaderCard: {
    alignItems: 'center',
    borderRadius: 24,
    padding: 24,
    marginTop: 8,
    marginBottom: 14,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    marginBottom: 8,
  },
  proBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  profileStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  profileMenu: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileMenuText: {
    fontSize: 15,
    fontWeight: '600',
  },
  profileAvatarWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarBadge: {
    position: 'absolute',
    right: 0,
    bottom: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  changePhotoBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 8,
  },
  changePhotoBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  // ── Guest Countdown Card Styles ───────────────────────────────────────────
  guestCountdownCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  countdownHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  countdownIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  countdownSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  countdownBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    marginBottom: 8,
  },
  countdownBadge: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  countdownBadgeNumber: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  countdownBadgeLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.8,
  },
  countdownColon: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: -8,
  },
  countdownNotice: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
});
