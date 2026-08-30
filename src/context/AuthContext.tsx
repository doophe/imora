/**
 * AuthContext & AuthProvider
 * Global authentication and user state management for Imora.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { authService } from '../services/authService';
import { auth, isFirebaseConfigured } from '../services/firebase';
import { UserProfile } from '../types/auth';

const LOCAL_SAVED_KEY = '@imora_saved_prompt_ids';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
  savedPromptIds: string[];
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  toggleSavePrompt: (promptId: string) => Promise<void>;
  isPromptSaved: (promptId: string) => boolean;
  updateProfilePhoto: (photoURL: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [localSavedIds, setLocalSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize session & local saved prompts on startup
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        const [cachedUser, cachedSaved] = await Promise.all([
          authService.getLocalSession(),
          AsyncStorage.getItem(LOCAL_SAVED_KEY),
        ]);

        if (mounted) {
          if (cachedUser) {
            setUser(cachedUser);
            if (cachedUser.savedPromptIds && cachedUser.savedPromptIds.length > 0) {
              setLocalSavedIds(cachedUser.savedPromptIds);
            }
          }
          if (cachedSaved) {
            try {
              const parsed = JSON.parse(cachedSaved);
              if (Array.isArray(parsed)) {
                setLocalSavedIds(prev => Array.from(new Set([...prev, ...parsed])));
              }
            } catch {}
          }
        }
      } catch {
        // Ignore
      }
    }

    initSession();

    // Firebase Auth listener (only for registered non-anonymous accounts)
    if (isFirebaseConfigured() && auth) {
      try {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
          if (fbUser && !fbUser.isAnonymous && mounted) {
            try {
              const profile = await authService.syncFirestoreUser(fbUser);
              setUser(profile);
              if (profile?.savedPromptIds) {
                setLocalSavedIds(prev => {
                  const merged = Array.from(new Set([...prev, ...profile.savedPromptIds]));
                  AsyncStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify(merged));
                  return merged;
                });
              }
            } catch {
              // Ignore
            }
          }
        });

        return () => {
          mounted = false;
          unsubscribe();
        };
      } catch {
        // Ignore
      }
    }

    return () => {
      mounted = false;
    };
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const profile = await authService.signInWithEmail(email, pass);
      setUser(profile);
      if (profile?.savedPromptIds) {
        setLocalSavedIds(prev => Array.from(new Set([...prev, ...profile.savedPromptIds])));
      }
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const profile = await authService.signUpWithEmail(email, pass, name);
      setUser(profile);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const profile = await authService.signInWithGoogle();
      setUser(profile);
      if (profile?.savedPromptIds) {
        setLocalSavedIds(prev => Array.from(new Set([...prev, ...profile.savedPromptIds])));
      }
    } finally {
      setLoading(false);
    }
  };

  const signInAsGuest = async () => {
    setLoading(true);
    try {
      const guest = await authService.signInAsGuest();
      setUser(guest);
      setLocalSavedIds(guest.savedPromptIds || []);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleSavePrompt = async (promptId: string) => {
    const exists = localSavedIds.includes(promptId);
    const updated = exists
      ? localSavedIds.filter(id => id !== promptId)
      : [...localSavedIds, promptId];

    setLocalSavedIds(updated);
    await AsyncStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify(updated));

    if (user) {
      setUser(prev => prev ? { ...prev, savedPromptIds: updated } : null);
      try {
        await authService.toggleSavePrompt(user.uid, promptId, localSavedIds);
      } catch (e) {
        console.warn('[AuthService] toggleSavePrompt Firestore sync error:', e);
      }
    }
  };

  const isPromptSaved = (promptId: string): boolean => {
    return localSavedIds.includes(promptId);
  };

  const updateProfilePhoto = async (photoURL: string) => {
    if (!user) return;
    const updated = await authService.updateProfilePhoto(user.uid, photoURL);
    if (updated) {
      setUser({ ...updated });
    } else {
      setUser(prev => prev ? { ...prev, photoURL } : null);
    }
  };

  const sendPasswordReset = async (email: string) => {
    await authService.sendPasswordReset(email);
  };

  const value: AuthContextType = {
    user,
    loading,
    isGuest: user?.provider === 'guest',
    savedPromptIds: localSavedIds,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInAsGuest,
    signOut,
    toggleSavePrompt,
    isPromptSaved,
    updateProfilePhoto,
    sendPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
