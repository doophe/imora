/**
 * Notification Service
 * Manages Real OS-level System Push Notifications (iOS Lock Screen / Android Status Bar)
 * using @notifee/react-native, as well as scheduled reminder notifications and in-app states.
 */

import notifee, {
  AndroidImportance,
  AndroidVisibility,
  EventType,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { PromptItem } from '../types';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'new_card' | 'reminder' | 'system';
  promptId?: string;
  timestamp: number;
  read: boolean;
}

const STORAGE_NOTIFICATIONS_KEY = '@imora_notifications';
const STORAGE_SEEN_PROMPTS_KEY = '@imora_seen_prompt_ids';
const STORAGE_SCHEDULED_FLAG_KEY = '@imora_has_scheduled_reminders_v1';
const CHANNEL_ID = 'imora_prompt_channel';

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_desert_1',
    title: 'Yeni bir kart eklendi!',
    message: 'Seni çöllere götürüyoruz! 🏜️ Mad Max Çöl Savaşçısı & Sinematik Film Karesi yayında.',
    type: 'new_card',
    promptId: 'img-4',
    timestamp: Date.now() - 1000 * 60 * 15,
    read: false,
  },
  {
    id: 'notif_space_reminder',
    title: 'Keşif Zamanı 🌌',
    message: 'Hadi gel seni uzaya çıkaralım! Hayalindeki atmosferik sahneleri oluştur.',
    type: 'reminder',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    read: false,
  },
  {
    id: 'notif_sunlight_portrait',
    title: 'Yeni bir kart eklendi!',
    message: 'Bordo tonlar ve keskin güneş ışığı! ☀️ Çapraz Güneş Işığı Portresi hazır.',
    type: 'new_card',
    promptId: 'img-5',
    timestamp: Date.now() - 1000 * 60 * 60 * 4,
    read: false,
  },
  {
    id: 'notif_watercolor_portrait',
    title: 'Yeni bir kart eklendi!',
    message: 'Suluboya ve mimari eskiz büyüsü! 🎨 Modern İllüstrasyon Portresi kütüphanede.',
    type: 'new_card',
    promptId: 'img-6',
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    read: false,
  },
  {
    id: 'notif_bw_studio',
    title: 'Yeni bir kart eklendi!',
    message: 'Siyah Beyaz Stüdyo Moda Portresi ile ultra detaylı stüdyo çekimlerini keşfet. 📸',
    type: 'new_card',
    promptId: 'img-3',
    timestamp: Date.now() - 1000 * 60 * 60 * 6,
    read: true,
  },
  {
    id: 'notif_noir_coffee',
    title: 'Yeni bir kart eklendi!',
    message: 'Dramatik Tungsten & Kahve Noir Portre ile melankolik ışık oyunlarını deneyimle. ☕',
    type: 'new_card',
    promptId: 'img-2',
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    read: true,
  },
];

export const notificationService = {
  /**
   * Request iOS & Android OS-Level System Notification Permissions
   */
  async requestSystemPermission(): Promise<boolean> {
    try {
      const settings = await notifee.requestPermission({
        sound: true,
        alert: true,
        badge: true,
      });
      return settings.authorizationStatus >= 1;
    } catch (e) {
      console.warn('[NotificationService] requestPermission error:', e);
      return false;
    }
  },

  /**
   * Setup Android high-priority channel
   */
  async ensureAndroidChannel(): Promise<void> {
    if (Platform.OS === 'android') {
      try {
        await notifee.createChannel({
          id: CHANNEL_ID,
          name: 'Imora Prompt & Hatırlatma Bildirimleri',
          importance: AndroidImportance.HIGH,
          visibility: AndroidVisibility.PUBLIC,
          sound: 'default',
          vibration: true,
        });
      } catch (e) {
        console.warn('[NotificationService] createChannel error:', e);
      }
    }
  },

  /**
   * Display a real OS system notification immediately on the phone
   */
  async displaySystemNotification(title: string, body: string, promptId?: string): Promise<void> {
    try {
      await this.ensureAndroidChannel();
      await notifee.displayNotification({
        title,
        body,
        data: promptId ? { promptId } : undefined,
        ios: {
          sound: 'default',
          critical: false,
          foregroundPresentationOptions: {
            banner: true,
            sound: true,
            badge: true,
            list: true,
          },
        },
        android: {
          channelId: CHANNEL_ID,
          importance: AndroidImportance.HIGH,
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
        },
      });
    } catch (e) {
      console.warn('[NotificationService] displaySystemNotification error:', e);
    }
  },

  /**
   * Schedule recurring/periodic reminder system notifications on the device
   */
  async scheduleSystemReminders(): Promise<void> {
    try {
      const alreadyScheduled = await AsyncStorage.getItem(STORAGE_SCHEDULED_FLAG_KEY);
      if (alreadyScheduled) return;

      await this.ensureAndroidChannel();

      // Reminder 1: 4 hours from now
      const trigger4h: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: Date.now() + 4 * 60 * 60 * 1000,
      };

      await notifee.createTriggerNotification(
        {
          id: 'reminder_4h_space',
          title: 'Keşif Zamanı 🌌',
          body: 'Hadi gel seni uzaya çıkaralım! Hayalindeki atmosferik sahneleri oluştur.',
          ios: { sound: 'default' },
          android: {
            channelId: CHANNEL_ID,
            importance: AndroidImportance.HIGH,
            pressAction: { id: 'default' },
          },
        },
        trigger4h
      );

      // Reminder 2: 24 hours from now
      const trigger24h: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: Date.now() + 24 * 60 * 60 * 1000,
      };

      await notifee.createTriggerNotification(
        {
          id: 'reminder_24h_creative',
          title: 'İlham Vakti 📸',
          body: 'Bugün yeni bir görsel tasarlamaya ne dersin? En popüler sinematik promptları keşfet.',
          ios: { sound: 'default' },
          android: {
            channelId: CHANNEL_ID,
            importance: AndroidImportance.HIGH,
            pressAction: { id: 'default' },
          },
        },
        trigger24h
      );

      // Reminder 3: 48 hours from now
      const trigger48h: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: Date.now() + 48 * 60 * 60 * 1000,
      };

      await notifee.createTriggerNotification(
        {
          id: 'reminder_48h_desert',
          title: 'Yeni bir kart eklendi! 🏜️',
          body: 'Seni çöllere götürüyoruz! Mad Max Çöl Savaşçısı & Sinematik Film Karesi kütüphanede.',
          data: { promptId: 'img-4' },
          ios: { sound: 'default' },
          android: {
            channelId: CHANNEL_ID,
            importance: AndroidImportance.HIGH,
            pressAction: { id: 'default' },
          },
        },
        trigger48h
      );

      await AsyncStorage.setItem(STORAGE_SCHEDULED_FLAG_KEY, 'true');
    } catch (e) {
      console.warn('[NotificationService] scheduleSystemReminders error:', e);
    }
  },

  /**
   * Get all notifications
   */
  async getNotifications(): Promise<AppNotification[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      await AsyncStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string): Promise<AppNotification[]> {
    try {
      const list = await this.getNotifications();
      const updated = list.map(item => (item.id === id ? { ...item, read: true } : item));
      await AsyncStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<AppNotification[]> {
    try {
      const list = await this.getNotifications();
      const updated = list.map(item => ({ ...item, read: true }));
      await AsyncStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },

  /**
   * Check for newly added prompts that user hasn't seen yet, trigger real OS phone notification
   */
  async checkForNewPrompts(prompts: PromptItem[]): Promise<AppNotification | null> {
    try {
      const seenRaw = await AsyncStorage.getItem(STORAGE_SEEN_PROMPTS_KEY);
      const seenIds: string[] = seenRaw ? JSON.parse(seenRaw) : [];

      const unseenPrompt = prompts.find(p => !seenIds.includes(p.id));

      if (unseenPrompt) {
        let message = `Yeni prompt kütüphaneye eklendi: ${unseenPrompt.title}`;
        if (unseenPrompt.id === 'img-4' || unseenPrompt.title.toLowerCase().includes('çöl')) {
          message = 'Seni çöllere götürüyoruz! 🏜️ Mad Max Çöl Savaşçısı & Sinematik Film Karesi yayında.';
        } else if (unseenPrompt.id === 'img-5' || unseenPrompt.title.toLowerCase().includes('güneş')) {
          message = 'Bordo tonlar ve keskin güneş ışığı! ☀️ Çapraz Güneş Işığı Portresi hazır.';
        } else if (unseenPrompt.id === 'img-6' || unseenPrompt.title.toLowerCase().includes('suluboya') || unseenPrompt.title.toLowerCase().includes('illüstrasyon')) {
          message = 'Suluboya ve mimari eskiz büyüsü! 🎨 Modern İllüstrasyon Portresi kütüphanede.';
        } else if (unseenPrompt.id === 'img-7' || unseenPrompt.title.toLowerCase().includes('moody')) {
          message = 'Doğal ışık ve editoryal sinematik kadın portresi! ✨ Moody Portre kartı yayında.';
        } else if (unseenPrompt.id === 'img-2' || unseenPrompt.title.toLowerCase().includes('noir')) {
          message = 'Sıcak bir kahve ve sinematik ışıklar! ☕ Dramatik Tungsten Noir kartı hazır.';
        } else if (unseenPrompt.id === 'img-3' || unseenPrompt.title.toLowerCase().includes('moda')) {
          message = 'Stüdyo ışıkları senin için yandı! 📸 Siyah Beyaz Moda Portresi yayında.';
        }

        const newNotif: AppNotification = {
          id: 'notif_prompt_' + unseenPrompt.id + '_' + Date.now(),
          title: 'Yeni bir kart eklendi!',
          message,
          type: 'new_card',
          promptId: unseenPrompt.id,
          timestamp: Date.now(),
          read: false,
        };

        // Save updated notifications
        const list = await this.getNotifications();
        const updatedList = [newNotif, ...list.filter(n => n.promptId !== unseenPrompt.id)];
        await AsyncStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(updatedList));

        // Mark as seen
        const updatedSeen = Array.from(new Set([...seenIds, unseenPrompt.id]));
        await AsyncStorage.setItem(STORAGE_SEEN_PROMPTS_KEY, JSON.stringify(updatedSeen));

        // FIRE REAL OS SYSTEM NOTIFICATION TO THE PHONE (Lock Screen / Status Bar)
        await this.displaySystemNotification(newNotif.title, newNotif.message, unseenPrompt.id);

        return newNotif;
      }
    } catch (e) {
      console.warn('[NotificationService] check error:', e);
    }
    return null;
  },

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<number> {
    const list = await this.getNotifications();
    return list.filter(n => !n.read).length;
  },
};
