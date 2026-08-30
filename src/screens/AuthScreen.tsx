/**
 * AuthScreen — Modern Light UI Login & Register Screen
 * Features:
 *  - Imora luxury branding & emblem
 *  - Animated Segmented Tab: [ Giriş Yap | Kayıt Ol ]
 *  - Form submission with Email & Password
 *  - Google & Apple Sign-In Integration
 *  - Guest skip mode
 *  - Inline error feedback & loading states
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppleIcon, GoogleIcon, LockIcon } from '../components/NavIcons';
import { useAuth } from '../context/AuthContext';

const PRIMARY_BLUE = '#0096C7';
const BLUE_DARK = '#0077B6';
const BG_COLOR = '#F8F9FA';
const TEXT_DARK = '#0F172A';

interface AuthScreenProps {
  onSuccess?: () => void;
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInAsGuest,
    sendPasswordReset,
  } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password Reset State
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetErrorMsg, setResetErrorMsg] = useState('');

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Lütfen tüm zorunlu alanları doldurunuz.');
      return;
    }

    if (isRegister && !name.trim()) {
      setErrorMsg('Lütfen ad ve soyadınızı giriniz.');
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
      onSuccess?.();
    } catch (err: any) {
      const msg = err?.message || 'Giriş yapılırken bir hata oluştu.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setSubmitting(true);
    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google ile giriş yapılırken bir sorun oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReset = () => {
    setResetEmail(email.trim());
    setResetErrorMsg('');
    setResetModalVisible(true);
  };

  const handleSendReset = async () => {
    setResetErrorMsg('');
    const target = resetEmail.trim();
    if (!target) {
      setResetErrorMsg('Lütfen e-posta adresinizi giriniz.');
      return;
    }
    setResetSubmitting(true);
    try {
      await sendPasswordReset(target);
      setResetModalVisible(false);
      Alert.alert(
        'Sıfırlama Bağlantısı Gönderildi',
        `${target} adresine şifre sıfırlama bağlantısı gönderildi.\n\nLütfen gelen kutunuzu (ve spam/gereksiz klasörünü) kontrol edip bağlantıya tıklayarak yeni şifrenizi oluşturun.`
      );
    } catch (err: any) {
      setResetErrorMsg(err?.message || 'Şifre sıfırlama e-postası gönderilemedi.');
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleGuestSignIn = () => {
    Alert.alert(
      'Misafir Oturumu',
      'Misafir hesapları ilk girişinizden itibaren 30 gün boyunca geçerlidir ve 30 gün sonra otomatik olarak silinir.\n\nKalan sürenizi Profil sayfanızdaki geri sayım sayacından takip edebilirsiniz.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Misafir Olarak Devam Et',
          onPress: async () => {
            setErrorMsg('');
            setSubmitting(true);
            try {
              await signInAsGuest();
              onSuccess?.();
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + (Platform.OS === 'android' ? 16 : 24),
            paddingBottom: insets.bottom + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* ── Top Skip / Guest Button ── */}
        <View style={styles.topBar}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={handleGuestSignIn}
            activeOpacity={0.7}
            disabled={submitting}
            style={styles.guestBtn}>
            <Text style={styles.guestBtnText}>Misafir Olarak Gir ›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Branding Header ── */}
        <View style={styles.brandHeader}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.brandLogoImg}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>Imora</Text>
          <Text style={styles.brandSubtitle}>
            {isRegister
              ? 'Hesabınızı oluşturun ve en iyi AI promptlarını keşfedin'
              : 'Giriş yapın ve yapay zeka prompt kütüphanenize erişin'}
          </Text>
        </View>

        {/* ── Segmented Tab Control [ Giriş Yap | Kayıt Ol ] ── */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, !isRegister && styles.segmentBtnActive]}
            onPress={() => { setIsRegister(false); setErrorMsg(''); }}
            activeOpacity={0.8}>
            <Text style={[styles.segmentText, !isRegister && styles.segmentTextActive]}>
              Giriş Yap
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, isRegister && styles.segmentBtnActive]}
            onPress={() => { setIsRegister(true); setErrorMsg(''); }}
            activeOpacity={0.8}>
            <Text style={[styles.segmentText, isRegister && styles.segmentTextActive]}>
              Kayıt Ol
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Error Banner ── */}
        {errorMsg.length > 0 && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* ── Form Card ── */}
        <View style={styles.formCard}>
          {isRegister && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ad Soyad</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Efe Yılmaz"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!submitting}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>E-posta Adresi</Text>
            <TextInput
              style={styles.input}
              placeholder="ornek@imora.ai"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!submitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.passwordLabelRow}>
              <Text style={styles.inputLabel}>Şifre</Text>
              {!isRegister && (
                <TouchableOpacity
                  onPress={handleOpenReset}
                  activeOpacity={0.7}>
                  <Text style={styles.forgotText}>Şifremi Unuttum?</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.passwordInputWrap}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!submitting}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                activeOpacity={0.7}>
                <Text style={styles.eyeBtnText}>{showPassword ? 'Gizle' : 'Göster'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Primary Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
            style={styles.submitBtn}>
            <LinearGradient
              colors={[PRIMARY_BLUE, BLUE_DARK]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGrad}>
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitText}>
                  {isRegister ? 'Hesap Oluştur' : 'Giriş Yap'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── Social Divider ── */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>veya şununla devam et</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ── Social Login Buttons ── */}
        <View style={styles.socialButtonsWrap}>
          {/* Google Sign In */}
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={submitting}
            activeOpacity={0.85}
            style={styles.googleBtn}>
            <GoogleIcon size={20} />
            <Text style={styles.googleBtnText}>Google ile Devam Et</Text>
          </TouchableOpacity>
        </View>

        {/* ── Terms & Privacy Footer ── */}
        <Text style={styles.termsText}>
          Devam ederek Imora{' '}
          <Text style={styles.termsLink}>Kullanım Koşulları</Text> ve{' '}
          <Text style={styles.termsLink}>Gizlilik Politikası</Text>'nı kabul etmiş olursunuz.
        </Text>
      </ScrollView>

      {/* ── Password Reset Modal ── */}
      <Modal
        visible={resetModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !resetSubmitting && setResetModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => !resetSubmitting && setResetModalVisible(false)}
          />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBox}>
                <LockIcon color={PRIMARY_BLUE} size={24} />
              </View>
              <Text style={styles.modalTitle}>Şifre Sıfırlama</Text>
              <Text style={styles.modalDesc}>
                Hesabınıza kayıtlı e-posta adresinizi girin. Yeni şifre oluşturabileceğiniz sıfırlama bağlantısını e-postanıza gönderelim.
              </Text>
            </View>

            {resetErrorMsg.length > 0 && (
              <View style={styles.modalErrorBanner}>
                <Text style={styles.modalErrorText}>{resetErrorMsg}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-posta Adresi</Text>
              <TextInput
                style={styles.input}
                placeholder="ornek@imora.ai"
                placeholderTextColor="#94A3B8"
                value={resetEmail}
                onChangeText={setResetEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!resetSubmitting}
                autoFocus
              />
            </View>

            <TouchableOpacity
              onPress={handleSendReset}
              disabled={resetSubmitting}
              activeOpacity={0.85}
              style={styles.submitBtn}>
              <LinearGradient
                colors={[PRIMARY_BLUE, BLUE_DARK]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGrad}>
                {resetSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitText}>Sıfırlama Bağlantısı Gönder</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setResetModalVisible(false)}
              disabled={resetSubmitting}
              style={styles.modalCancelBtn}
              activeOpacity={0.7}>
              <Text style={styles.modalCancelText}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  guestBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F4',
  },
  guestBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  // Brand Header
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandLogoImg: {
    width: 68,
    height: 68,
    borderRadius: 18,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY_BLUE,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: TEXT_DARK,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 20,
  },

  // Segmented Tab
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF0F4',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: TEXT_DARK,
    fontWeight: '700',
  },

  // Error Banner
  errorBanner: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Form Card
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEF0F4',
    marginBottom: 24,
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 8,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotText: {
    fontSize: 12,
    color: PRIMARY_BLUE,
    fontWeight: '600',
  },
  input: {
    height: 48,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 14,
    color: TEXT_DARK,
  },
  passwordInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    height: 48,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: TEXT_DARK,
    padding: 0,
  },
  eyeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  eyeBtnText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  submitBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 6,
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY_BLUE,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitGrad: {
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    height: 50,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },

  // Social Buttons
  socialButtonsWrap: {
    gap: 12,
    marginBottom: 24,
  },
  appleBtn: {
    height: 50,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  appleBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  googleBtn: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  googleBtnText: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '700',
  },

  // Footer
  termsText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 17,
  },
  termsLink: {
    color: PRIMARY_BLUE,
    fontWeight: '600',
  },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 18,
  },
  modalIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E0F4FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: TEXT_DARK,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  modalDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 8,
  },
  modalErrorBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  modalErrorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalCancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 6,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
});
