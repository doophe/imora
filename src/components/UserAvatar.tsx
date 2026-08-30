/**
 * UserAvatar — Universal Modern Profile Avatar Component
 * Displays user photo if available; otherwise renders a clean, professional
 * vector avatar / monogram matching the Imora Azure Blue brand theme.
 * Zero random stock photos.
 */

import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ProfileIcon } from './NavIcons';

interface UserAvatarProps {
  photoURL?: string | null;
  name?: string | null;
  size?: number;
  isGuest?: boolean;
}

const PRIMARY_BLUE = '#0096C7';
const PRIMARY_BLUE_DARK = '#0284C7';

export default function UserAvatar({
  photoURL,
  name,
  size = 38,
  isGuest = false,
}: UserAvatarProps) {
  // If user has a real uploaded or Google profile image
  if (photoURL && photoURL.trim().length > 0) {
    return (
      <View style={[styles.avatarWrap, { width: size, height: size, borderRadius: size / 2 }]}>
        <Image
          source={{ uri: photoURL }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
        />
      </View>
    );
  }

  // If user has a specific name and is not a guest
  const initial =
    !isGuest && name && name.trim().length > 0 && name.trim() !== 'Kullanıcı' && name.trim() !== 'Misafir Kullanıcı'
      ? name.trim().charAt(0).toUpperCase()
      : null;

  return (
    <View style={[styles.avatarWrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <LinearGradient
        colors={['#E0F4FB', '#BAE6FD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.placeholderGradient, { width: size, height: size, borderRadius: size / 2 }]}>
        {initial ? (
          <Text
            style={[
              styles.monogramText,
              {
                fontSize: Math.round(size * 0.44),
                color: PRIMARY_BLUE_DARK,
              },
            ]}>
            {initial}
          </Text>
        ) : (
          <ProfileIcon color={PRIMARY_BLUE} size={Math.round(size * 0.52)} />
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarWrap: {
    overflow: 'hidden',
    backgroundColor: '#E0F4FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderGradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramText: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
