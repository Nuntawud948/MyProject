/**
 * @file LoginScreen.tsx
 * @description Authentication screen — username/password login form styled using the WorkForce design system.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../theme';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';

export function LoginScreen() {
  const { login, isLoading, error } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [progressWidth, setProgressWidth] = useState(0);

  // Update top progress bar based on input completion
  useEffect(() => {
    let width = 0;
    if (email.length > 0) width += 50;
    if (password.length > 0) width += 50;
    setProgressWidth(width);
  }, [email, password]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter your email and password.');
      return;
    }
    try {
      await login({ username: email.trim(), password });
      navigation.navigate('Dashboard');
    } catch (err) {
      console.log("Login screen transition state error:", err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Top Progress Polish Element */}
      <View style={[styles.progressBarContainer, { top: insets.top }]}>
        <View style={[styles.progressBar, { width: `${progressWidth}%` }]} />
      </View>

      {/* Background Decorative Blur Circles for Desktop/Tablet Feel */}
      <View style={styles.decoCircleLeft} />
      <View style={styles.decoCircleRight} />

      {/* Loading Dialog Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isLoading}
        onRequestClose={() => {}}
      >
        <View style={styles.modalBackground}>
          <View style={styles.activityIndicatorWrapper}>
            <ActivityIndicator animating={isLoading} color={Theme.colors.primary} size="large" />
            <Text style={styles.loadingText}>Signing in...</Text>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: 48 + insets.top, paddingBottom: 48 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Brand Identity Section ──────────────────────────────────────── */}
        <View style={styles.brandSection}>
          <View style={styles.logoBox}>
            <MaterialIcons
              name="lock"
              size={36}
              color={Theme.colors.primary}
            />
          </View>
          <Text style={styles.appTitle}>WorkForce</Text>
        </View>

        {/* ── Login Container Card ─────────────────────────────────────────── */}
        <View style={[styles.card, Theme.elevation.level1]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>
              Securely access your HR dashboard and payroll.
            </Text>
          </View>

          <View style={styles.form}>
            {/* Email Input */}
            <CustomInput
              label="Employee Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            {/* Password Input */}
            <CustomInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              isPassword={true}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            {/* Error Message */}
            {error ? (
              <View style={styles.errorBanner}>
                <MaterialIcons name="error-outline" size={18} color={Theme.colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <CustomButton
              title="Sign In"
              onPress={handleLogin}
              isLoading={isLoading}
              icon={
                <MaterialIcons
                  name="arrow-forward"
                  size={20}
                  color={Theme.colors.onPrimary}
                />
              }
            />
          </View>

          {/* Secure Biometric Divider */}
          <View style={styles.biometricDividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.biometricDividerText}>OR SECURE BIOMETRIC</Text>
            <View style={styles.dividerLine} />
          </View>
        </View>

        {/* ── Global Footer Information ───────────────────────────────────── */}
        <View style={styles.footerContainer}>
          <TouchableOpacity style={styles.supportLink} activeOpacity={0.7}>
            <MaterialIcons name="help-outline" size={18} color={Theme.colors.onSurfaceVariant} />
            <Text style={styles.supportText}>Contact Support</Text>
          </TouchableOpacity>

          <View style={styles.encryptionContainer}>
            <MaterialIcons name="verified-user" size={14} color={Theme.colors.outline} />
            <Text style={styles.encryptionText}>AES-256 Bit Encryption Secured</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(0, 91, 191, 0.1)',
    zIndex: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Theme.colors.primary,
  },
  decoCircleLeft: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0, 91, 191, 0.03)',
    zIndex: -1,
  },
  decoCircleRight: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(158, 67, 0, 0.03)',
    zIndex: -1,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.marginMobile,
    paddingVertical: 48,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBox: {
    width: 64,
    height: 64,
    backgroundColor: Theme.colors.primaryContainer,
    borderRadius: Theme.rounded.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    opacity: 0.9,
  },
  appTitle: {
    fontSize: Theme.typography.headlineMd.fontSize,
    fontFamily: Theme.typography.headlineMd.fontFamily,
    fontWeight: '600',
    color: Theme.colors.primary,
    letterSpacing: -0.5,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Theme.colors.surfaceContainerLowest,
    borderRadius: Theme.rounded.xl,
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 214, 0.3)',
  },
  cardHeader: {
    marginBottom: 28,
  },
  cardTitle: {
    fontSize: Theme.typography.headlineLgMobile.fontSize,
    fontFamily: Theme.typography.headlineLgMobile.fontFamily,
    fontWeight: '700',
    color: Theme.colors.onSurface,
  },
  cardSubtitle: {
    fontSize: Theme.typography.bodyMd.fontSize,
    fontFamily: Theme.typography.bodyMd.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    marginTop: 8,
    lineHeight: Theme.typography.bodyMd.lineHeight,
  },
  form: {
    width: '100%',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.errorContainer,
    borderRadius: Theme.rounded.lg,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    color: Theme.colors.onErrorContainer,
    fontSize: Theme.typography.bodyMd.fontSize,
    fontFamily: Theme.typography.bodyMd.fontFamily,
    flex: 1,
  },
  biometricDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Theme.colors.outlineVariant,
  },
  biometricDividerText: {
    fontSize: Theme.typography.labelMd.fontSize,
    fontFamily: Theme.typography.labelMd.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    paddingHorizontal: 12,
    fontWeight: '500',
  },
  footerContainer: {
    marginTop: 32,
    alignItems: 'center',
    gap: 16,
  },
  supportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  supportText: {
    color: Theme.colors.onSurfaceVariant,
    fontSize: Theme.typography.labelLg.fontSize,
    fontFamily: Theme.typography.labelLg.fontFamily,
    fontWeight: '500',
  },
  encryptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.6,
  },
  encryptionText: {
    color: Theme.colors.onSurfaceVariant,
    fontSize: Theme.typography.labelMd.fontSize,
    fontFamily: Theme.typography.labelMd.fontFamily,
  },
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(25, 28, 29, 0.4)',
  },
  activityIndicatorWrapper: {
    backgroundColor: Theme.colors.surfaceContainerLowest,
    height: 120,
    width: 120,
    borderRadius: Theme.rounded.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingText: {
    color: Theme.colors.onSurface,
    fontSize: Theme.typography.bodyMd.fontSize,
    fontFamily: Theme.typography.bodyMd.fontFamily,
    fontWeight: '600',
  },
});

