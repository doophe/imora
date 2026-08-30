/**
 * ThemeContext — Global Theme Management for Imora
 * Supports 'light', 'dark', and 'system' with persistent storage.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeColors {
  isDark: boolean;
  bg: string;
  bgSecondary: string;
  surface: string;
  surfaceSubtle: string;
  border: string;
  borderLight: string;
  text: string;
  textSub: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  cardBg: string;
  navPillBg: string;
  navPillBorder: string;
  statusBarStyle: 'dark-content' | 'light-content';
}

const LIGHT_COLORS: ThemeColors = {
  isDark: false,
  bg: '#F6F7F9',
  bgSecondary: '#EEF0F4',
  surface: '#FFFFFF',
  surfaceSubtle: '#F8FAFC',
  border: '#EEF0F4',
  borderLight: '#F1F5F9',
  text: '#0F172A',
  textSub: '#64748B',
  textMuted: '#94A3B8',
  primary: '#0096C7',
  primaryLight: '#E0F4FB',
  primaryDark: '#0077B6',
  cardBg: '#FFFFFF',
  navPillBg: '#FFFFFF',
  navPillBorder: '#EEF0F4',
  statusBarStyle: 'dark-content',
};

const DARK_COLORS: ThemeColors = {
  isDark: true,
  bg: '#090D16',
  bgSecondary: '#111827',
  surface: '#151D2F',
  surfaceSubtle: '#1C263D',
  border: '#1E293B',
  borderLight: '#24324D',
  text: '#F8FAFC',
  textSub: '#94A3B8',
  textMuted: '#64748B',
  primary: '#00B4D8',
  primaryLight: 'rgba(0, 180, 216, 0.18)',
  primaryDark: '#0096C7',
  cardBg: '#151D2F',
  navPillBg: '#151D2F',
  navPillBorder: '#1E293B',
  statusBarStyle: 'light-content',
};

const THEME_STORAGE_KEY = '@imora_theme_preference';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    async function loadTheme() {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setThemeModeState(saved);
        }
      } catch (err) {
        console.warn('Failed to load theme preference', err);
      }
    }
    loadTheme();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (err) {
      console.warn('Failed to save theme preference', err);
    }
  };

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, colors, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
