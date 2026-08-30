/**
 * customPromptService — Kişisel Özel Prompt / Not Defteri Servisi
 * Kullanıcının sadece kendine özel prompt notlarını yerel olarak (AsyncStorage) saklar.
 * Hiçbir şekilde dışarıya paylaşılmaz, tamamen kişisel not defteri gibi çalışır.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PromptItem } from '../types';

const STORAGE_PREFIX = '@imora_private_custom_prompts_';

export const customPromptService = {
  /**
   * Kullanıcının kendi özel prompt notlarını getirir.
   */
  async getCustomPrompts(userId?: string): Promise<PromptItem[]> {
    try {
      const key = `${STORAGE_PREFIX}${userId || 'local'}`;
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return [];
      return JSON.parse(raw) as PromptItem[];
    } catch (err) {
      console.warn('Failed to load custom prompts', err);
      return [];
    }
  },

  /**
   * Yeni özel prompt notu oluşturur ve kaydeder.
   */
  async createCustomPrompt(
    userId: string | undefined,
    data: {
      title: string;
      category: string;
      prompt: string;
      tags: string[];
    }
  ): Promise<PromptItem> {
    const key = `${STORAGE_PREFIX}${userId || 'local'}`;
    const current = await this.getCustomPrompts(userId);

    // Rastgele zarif bir gradient tonu belirle
    const GRADIENTS = [
      ['#0F2027', '#203A43'],
      ['#141E30', '#243B55'],
      ['#1F1C2C', '#928DAB'],
      ['#0D1B2A', '#1B263B'],
      ['#16222F', '#1F3144'],
    ];
    const pickedGradient = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];

    const newPrompt: PromptItem = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: data.title.trim(),
      category: data.category.trim() || 'Özel Not',
      prompt: data.prompt.trim(),
      tags: data.tags.length > 0 ? data.tags : ['kişisel', 'özel not'],
      gradient: [pickedGradient[0], pickedGradient[1]],
      emoji: '✦',
    };

    const updated = [newPrompt, ...current];
    await AsyncStorage.setItem(key, JSON.stringify(updated));
    return newPrompt;
  },

  /**
   * Özel prompt notunu siler.
   */
  async deleteCustomPrompt(userId: string | undefined, promptId: string): Promise<PromptItem[]> {
    const key = `${STORAGE_PREFIX}${userId || 'local'}`;
    const current = await this.getCustomPrompts(userId);
    const updated = current.filter(p => p.id !== promptId);
    await AsyncStorage.setItem(key, JSON.stringify(updated));
    return updated;
  },

  /**
   * Özel prompt notunu günceller.
   */
  async updateCustomPrompt(userId: string | undefined, prompt: PromptItem): Promise<PromptItem[]> {
    const key = `${STORAGE_PREFIX}${userId || 'local'}`;
    const current = await this.getCustomPrompts(userId);
    const updated = current.map(p => (p.id === prompt.id ? prompt : p));
    await AsyncStorage.setItem(key, JSON.stringify(updated));
    return updated;
  },
};
