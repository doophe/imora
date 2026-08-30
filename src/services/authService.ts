/**
 * Authentication Service
 * Strictly integrated with Live Firebase Authentication & Cloud Firestore (imora-cf86d).
 * 100% REAL Firebase Auth & Real Google Sign-In. Zero mock data.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform, TurboModuleRegistry } from 'react-native';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '../types/auth';
import { auth, db } from './firebase';

const STORAGE_USER_KEY = '@imora_user_session';
const STORAGE_DEVICE_GUEST_KEY = '@imora_device_guest_profile';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
let memoryUserCache: UserProfile | null = null;

/**
 * Checks if the native TurboModule is registered in the native binary
 */
function isNativeModuleAvailable(moduleName: string): boolean {
  try {
    if (TurboModuleRegistry && typeof TurboModuleRegistry.get === 'function') {
      const mod = TurboModuleRegistry.get(moduleName);
      if (mod) return true;
    }
    if (NativeModules && NativeModules[moduleName]) {
      return true;
    }
  } catch {
    // Ignore
  }
  return false;
}

function getNativeGoogleSignin(): any {
  if (!isNativeModuleAvailable('RNGoogleSignin')) {
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('@react-native-google-signin/google-signin');
    if (mod && mod.GoogleSignin) {
      return mod;
    }
  } catch (e) {
    console.warn('[GoogleSignin] module load error:', e);
  }
  return null;
}

/**
 * Maps Firebase Auth error codes to user-friendly Turkish messages
 */
export function getFirebaseErrorMessage(error: any): string {
  const msg = error?.message || '';
  const code = error?.code || '';

  if (msg.includes('GoogleService-Info.plist was not found') || msg.includes('failed to determine clientID')) {
    return 'Google ile giriş yapabilmek için Firebase Console üzerinden GoogleService-Info.plist dosyasını indirip projeye eklemeniz gerekmektedir.';
  }

  if (msg.includes('DEVELOPER_ERROR') || code === '10' || code === 'DEVELOPER_ERROR') {
    return 'Android Google ile Giriş için Firebase Console üzerinden projenin SHA-1 sertifika parmak izinin eklenmesi ve google-services.json dosyasının yerleştirilmesi gerekmektedir.';
  }

  switch (code) {
    case 'auth/email-already-in-use':
      return 'Bu e-posta adresi ile kayıtlı bir hesap zaten var. Lütfen giriş yapın.';
    case 'auth/invalid-email':
      return 'Lütfen geçerli bir e-posta adresi giriniz.';
    case 'auth/weak-password':
      return 'Şifreniz çok zayıf. Lütfen en az 6 karakterli bir şifre belirleyin.';
    case 'auth/user-not-found':
      return 'Bu e-posta adresine kayıtlı bir hesap bulunamadı. Lütfen kayıt olun.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'E-posta adresi veya şifre hatalı. Lütfen kontrol edip tekrar deneyin.';
    case 'auth/user-disabled':
      return 'Bu kullanıcı hesabı yönetici tarafından devre dışı bırakılmış.';
    case 'auth/too-many-requests':
      return 'Çok fazla başarısız deneme yapıldı. Lütfen birkaç dakika bekleyin.';
    case 'auth/network-request-failed':
      return 'İnternet bağlantısı kurulamadı. Lütfen bağlantınızı kontrol edin.';
    case 'auth/operation-not-allowed':
      return 'Bu giriş yöntemi henüz Firebase Console üzerinden etkinleştirilmemiş.';
    default:
      return msg || 'Giriş işlemi sırasında bir hata oluştu.';
  }
}

export const authService = {
  /**
   * Save user session locally
   */
  async saveLocalSession(user: UserProfile | null): Promise<void> {
    memoryUserCache = user;
    try {
      if (user) {
        await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem(STORAGE_USER_KEY);
      }
    } catch (e) {
      console.warn('[AuthService] AsyncStorage save error', e);
    }
  },

  /**
   * Get cached local user session
   */
  async getLocalSession(): Promise<UserProfile | null> {
    if (memoryUserCache) {
      if (memoryUserCache.provider === 'guest') {
        const created = memoryUserCache.createdAt || Date.now();
        if (Date.now() - created >= THIRTY_DAYS_MS) {
          await this.clearGuestSession();
          return null;
        }
      }
      return memoryUserCache;
    }
    try {
      const data = await AsyncStorage.getItem(STORAGE_USER_KEY);
      if (data) {
        const parsed: UserProfile = JSON.parse(data);
        if (parsed.provider === 'guest') {
          const created = parsed.createdAt || Date.now();
          if (Date.now() - created >= THIRTY_DAYS_MS) {
            await this.clearGuestSession();
            return null;
          }
        }
        memoryUserCache = parsed;
        return memoryUserCache;
      }
    } catch {
      // Memory fallback
    }
    return memoryUserCache;
  },

  /**
   * Clear guest session & reset device guest profile when 30 days elapse
   */
  async clearGuestSession(): Promise<void> {
    memoryUserCache = null;
    try {
      await AsyncStorage.removeItem(STORAGE_USER_KEY);
      await AsyncStorage.removeItem(STORAGE_DEVICE_GUEST_KEY);
    } catch (e) {
      console.warn('[AuthService] clearGuestSession error:', e);
    }
  },

  /**
   * Fetch or create real user document in Cloud Firestore
   */
  async syncFirestoreUser(
    firebaseUser: User | { uid: string; email?: string | null; displayName?: string | null; photoURL?: string | null },
    provider: 'google' | 'password' | 'guest' = 'password',
    customDisplayName?: string
  ): Promise<UserProfile> {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snapshot = await getDoc(userRef);

      const targetDisplayName =
        customDisplayName?.trim() ||
        firebaseUser.displayName?.trim() ||
        (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Kullanıcı');

      if (snapshot.exists()) {
        const data = snapshot.data();
        const latestPhoto = firebaseUser.photoURL || data.photoURL || null;

        // Check if name was provided or needs updating in Firestore
        const shouldUpdateName =
          Boolean(customDisplayName?.trim() && customDisplayName.trim() !== data.displayName) ||
          Boolean(firebaseUser.displayName?.trim() && firebaseUser.displayName.trim() !== data.displayName && !data.displayName);

        const finalDisplayName = shouldUpdateName
          ? (customDisplayName?.trim() || firebaseUser.displayName?.trim() || data.displayName)
          : (data.displayName || targetDisplayName);

        const profile: UserProfile = {
          uid: firebaseUser.uid,
          email: data.email ?? firebaseUser.email ?? null,
          displayName: finalDisplayName,
          photoURL: latestPhoto,
          provider: data.provider ?? provider,
          savedPromptIds: Array.isArray(data.savedPromptIds) ? data.savedPromptIds : [],
          createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
        };

        const updates: any = {};
        if (shouldUpdateName) {
          updates.displayName = finalDisplayName;
          updates.fullName = finalDisplayName;
          updates.name = finalDisplayName;
        }
        if (firebaseUser.photoURL && firebaseUser.photoURL !== data.photoURL) {
          updates.photoURL = firebaseUser.photoURL;
        }
        if (Object.keys(updates).length > 0) {
          updates.updatedAt = serverTimestamp();
          try {
            await updateDoc(userRef, updates);
          } catch (e) {
            console.warn('[Firestore] syncFirestoreUser updateDoc warning:', e);
          }
        }

        await this.saveLocalSession(profile);
        return profile;
      } else {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? null,
          displayName: targetDisplayName,
          photoURL: firebaseUser.photoURL ?? null,
          provider,
          savedPromptIds: [],
          createdAt: Date.now(),
        };

        // Create new document in Cloud Firestore with full name info
        await setDoc(userRef, {
          uid: newProfile.uid,
          email: newProfile.email,
          displayName: newProfile.displayName,
          fullName: newProfile.displayName,
          name: newProfile.displayName,
          photoURL: newProfile.photoURL,
          provider: newProfile.provider,
          savedPromptIds: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        await this.saveLocalSession(newProfile);
        return newProfile;
      }
    } catch (err) {
      console.warn('[Firestore] User document sync warning:', err);
      const profile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? null,
        displayName: customDisplayName?.trim() || firebaseUser.displayName?.trim() || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Kullanıcı'),
        photoURL: firebaseUser.photoURL ?? null,
        provider,
        savedPromptIds: [],
        createdAt: Date.now(),
      };
      await this.saveLocalSession(profile);
      return profile;
    }
  },

  /**
   * E-posta ve Şifre ile Canlı Kayıt Ol (Real Firebase Auth)
   */
  async signUpWithEmail(email: string, pass: string, displayName: string): Promise<UserProfile> {
    try {
      const cleanName = displayName.trim();
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (cleanName) {
        try {
          await updateProfile(cred.user, { displayName: cleanName });
        } catch (e) {
          console.warn('[AuthService] updateProfile warning:', e);
        }
      }
      return await this.syncFirestoreUser(cred.user, 'password', cleanName);
    } catch (error: any) {
      const friendlyMessage = getFirebaseErrorMessage(error);
      const customErr = new Error(friendlyMessage);
      (customErr as any).code = error?.code;
      throw customErr;
    }
  },

  /**
   * E-posta ve Şifre ile Canlı Giriş Yap (Real Firebase Auth)
   */
  async signInWithEmail(email: string, pass: string): Promise<UserProfile> {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      return await this.syncFirestoreUser(cred.user, 'password');
    } catch (error: any) {
      const friendlyMessage = getFirebaseErrorMessage(error);
      const customErr = new Error(friendlyMessage);
      (customErr as any).code = error?.code;
      throw customErr;
    }
  },

  /**
   * E-posta ile Şifre Sıfırlama Bağlantısı Gönder (Firebase sendPasswordResetEmail)
   */
  async sendPasswordReset(email: string): Promise<void> {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      throw new Error('Lütfen geçerli bir e-posta adresi giriniz.');
    }
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch (error: any) {
      const friendlyMessage = getFirebaseErrorMessage(error);
      const customErr = new Error(friendlyMessage);
      (customErr as any).code = error?.code;
      throw customErr;
    }
  },

  /**
   * Google ile Canlı Giriş Yap (Gerçek Google Hesabı ile Giriş)
   */
  async signInWithGoogle(): Promise<UserProfile> {
    const googlePkg = getNativeGoogleSignin();

    if (!googlePkg) {
      throw new Error(
        'Google ile giriş yapabilmek için uygulamanın derlenmesi gerekiyor.'
      );
    }

    try {
      const { GoogleSignin } = googlePkg;

      // Configure safely with live client IDs from Firebase config files
      try {
        await GoogleSignin.configure({
          scopes: ['email', 'profile'],
          iosClientId: '59463919192-d6g1qqqckoj2rqivqsg5lscd3i08rl7l.apps.googleusercontent.com',
          webClientId: '59463919192-oc2aqmjg3tjbpb2pi0c0gbepk1dqb0qd.apps.googleusercontent.com',
        });
      } catch (configErr: any) {
        throw new Error(getFirebaseErrorMessage(configErr));
      }

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult?.data?.idToken || signInResult?.idToken;

      if (!idToken) {
        throw new Error('Google giriş jetonu (idToken) alınamadı. Lütfen tekrar deneyiniz.');
      }

      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      return await this.syncFirestoreUser(userCredential.user, 'google');
    } catch (err: any) {
      if (
        err?.code === 'SIGN_IN_CANCELLED' ||
        err?.code === '13' ||
        err?.code === '12501'
      ) {
        throw new Error('Google ile giriş işlemi iptal edildi.');
      }
      const friendly = getFirebaseErrorMessage(err);
      throw new Error(friendly);
    }
  },

  /**
   * Misafir Olarak Devam Et (Persistent Local Device Guest Account)
   * Completely stored locally in AsyncStorage without writing junk data to Firestore.
   */
  async signInAsGuest(): Promise<UserProfile> {
    try {
      const existing = await AsyncStorage.getItem(STORAGE_DEVICE_GUEST_KEY);
      if (existing) {
        const guest: UserProfile = JSON.parse(existing);
        const created = guest.createdAt || Date.now();
        // If expired (>= 30 days)
        if (Date.now() - created >= THIRTY_DAYS_MS) {
          await this.clearGuestSession();
        } else {
          await this.saveLocalSession(guest);
          return guest;
        }
      }
    } catch (e) {
      console.warn('[AuthService] Read device guest error:', e);
    }

    const deviceGuestUid = 'device_guest_imora';
    const newGuest: UserProfile = {
      uid: deviceGuestUid,
      email: null,
      displayName: 'Misafir Kullanıcı',
      photoURL: null,
      provider: 'guest',
      savedPromptIds: [],
      createdAt: Date.now(),
    };

    try {
      await AsyncStorage.setItem(STORAGE_DEVICE_GUEST_KEY, JSON.stringify(newGuest));
    } catch (e) {
      console.warn('[AuthService] Save device guest error:', e);
    }

    await this.saveLocalSession(newGuest);
    return newGuest;
  },

  /**
   * Çıkış Yap (Sign Out)
   */
  async signOut(): Promise<void> {
    if (auth?.currentUser) {
      try {
        await fbSignOut(auth);
      } catch (e) {
        console.warn('[AuthService] signOut warning:', e);
      }
    }
    await this.saveLocalSession(null);
  },

  /**
   * Toggle Save / Bookmark a Prompt for current user
   */
  async toggleSavePrompt(userId: string, promptId: string, currentSaved: string[]): Promise<string[]> {
    const exists = currentSaved.includes(promptId);
    const updated = exists ? currentSaved.filter(id => id !== promptId) : [...currentSaved, promptId];
    const isGuestUser = userId.startsWith('guest_') || userId === 'device_guest_imora';

    // Only update Firestore for real authenticated users (email / google)
    if (!isGuestUser && db) {
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          savedPromptIds: updated,
          updatedAt: serverTimestamp(),
        });
      } catch (e) {
        console.warn('[Firestore] updateDoc savedPromptIds warning:', e);
      }
    }

    const local = await this.getLocalSession();
    if (local && local.uid === userId) {
      local.savedPromptIds = updated;
      await this.saveLocalSession(local);
    }

    // If it's a device guest, persist updated list to device guest profile too
    if (isGuestUser) {
      try {
        const existingGuest = await AsyncStorage.getItem(STORAGE_DEVICE_GUEST_KEY);
        if (existingGuest) {
          const parsed: UserProfile = JSON.parse(existingGuest);
          parsed.savedPromptIds = updated;
          await AsyncStorage.setItem(STORAGE_DEVICE_GUEST_KEY, JSON.stringify(parsed));
        }
      } catch {}
    }

    return updated;
  },

  /**
   * Update profile photo in Firestore, Firebase Auth, and local session
   */
  async updateProfilePhoto(userId: string, photoURL: string): Promise<UserProfile | null> {
    const isGuestUser = userId.startsWith('guest_') || userId === 'device_guest_imora';

    if (!isGuestUser && db) {
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          photoURL,
          updatedAt: serverTimestamp(),
        });
      } catch (e) {
        console.warn('[Firestore] updateProfilePhoto warning:', e);
      }
    }

    if (auth?.currentUser && !isGuestUser) {
      try {
        await updateProfile(auth.currentUser, { photoURL });
      } catch {
        // Ignore
      }
    }

    const local = await this.getLocalSession();
    if (local && local.uid === userId) {
      local.photoURL = photoURL;
      await this.saveLocalSession(local);

      if (isGuestUser) {
        try {
          const existingGuest = await AsyncStorage.getItem(STORAGE_DEVICE_GUEST_KEY);
          if (existingGuest) {
            const parsed: UserProfile = JSON.parse(existingGuest);
            parsed.photoURL = photoURL;
            await AsyncStorage.setItem(STORAGE_DEVICE_GUEST_KEY, JSON.stringify(parsed));
          }
        } catch {}
      }

      return local;
    }
    return null;
  },
};
