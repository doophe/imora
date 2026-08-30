/**
 * Firebase Client Configuration & Service Manager
 * Connected to Live Firebase Project: imora-cf86d
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Live Firebase Configuration for imora-cf86d
export const firebaseConfig = {
  apiKey: "AIzaSyAXNiJnId-fmnvHNKKCCyeCgR2rOgYg8mQ",
  authDomain: "imora-cf86d.firebaseapp.com",
  projectId: "imora-cf86d",
  storageBucket: "imora-cf86d.firebasestorage.app",
  messagingSenderId: "59463919192",
  appId: "1:59463919192:web:0e738c6bd500a412d28c2d",
  measurementId: "G-FPLZJFT6J7",
};

// Returns true when configured
export const isFirebaseConfigured = (): boolean => true;

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth & Firestore
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
