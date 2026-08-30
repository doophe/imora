/**
 * Imora – AI Prompt Library
 *
 * App Flow:
 *  1. SplashScreen (Luxury intro loading)
 *  2. AuthScreen (Giriş Yap / Kayıt Ol with Google, Apple, Guest)
 *  3. LibraryScreen (Live Firebase / Cloud Firestore Prompts & User State)
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AuthScreen from './src/screens/AuthScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import SplashScreen from './src/screens/SplashScreen';

function AppNavigation() {
  const [splashDone, setSplashDone] = useState(false);
  const { user } = useAuth();
  const { colors } = useTheme();

  if (!splashDone) {
    return (
      <View style={[styles.splashRoot, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle={colors.statusBarStyle} backgroundColor="transparent" translucent />
        <SplashScreen onFinish={() => setSplashDone(true)} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.root, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle={colors.statusBarStyle} backgroundColor="transparent" translucent />
        <AuthScreen />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor="transparent" translucent />
      <LibraryScreen />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigation />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashRoot: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  root: {
    flex: 1,
    backgroundColor: '#F6F7F9',
  },
});
