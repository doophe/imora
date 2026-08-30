/**
 * Prompt Service
 * Fetches prompts & categories from Cloud Firestore with offline fallback to local catalogue.
 */

import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { CATEGORIES, PROMPTS } from '../data/prompts';
import { PromptItem } from '../types';
import { db } from './firebase';

export const promptService = {
  /**
   * Fetch all prompts or filter by category
   */
  async getPrompts(category?: string): Promise<PromptItem[]> {
    try {
      const promptsRef = collection(db, 'prompts');
      const q = category && category !== 'Tümü'
        ? query(promptsRef, where('category', '==', category), orderBy('createdAt', 'desc'))
        : query(promptsRef, orderBy('createdAt', 'desc'));

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const firestoreList: PromptItem[] = snapshot.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title ?? '',
            prompt: data.prompt ?? '',
            category: data.category ?? 'Görsel',
            tags: data.tags ?? [],
            emoji: data.emoji ?? 'P',
            gradient: data.gradient ?? ['#1a1a2e', '#16213e'],
            // In case of remote image URLs:
            imageSource: undefined,
          };
        });
        return firestoreList;
      }
    } catch (e) {
      // Local fallback
    }

    // Default to local prompts
    if (category && category !== 'Tümü') {
      return PROMPTS.filter(p => p.category === category);
    }
    return PROMPTS;
  },

  /**
   * Fetch category list
   */
  async getCategories(): Promise<string[]> {
    try {
      const catRef = collection(db, 'categories');
      const q = query(catRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        return snapshot.docs.map(d => d.data().name);
      }
    } catch {
      // Fallback
    }

    return CATEGORIES;
  },
};
