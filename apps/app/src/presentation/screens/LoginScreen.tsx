/**
 * @file LoginScreen.tsx
 * @description Authentication screen — username/password login form.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

export function LoginScreen() {
  const { login, isLoading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter your username and password.');
      return;
    }
    await login({ username: username.trim(), password });
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Branding ──────────────────────────────────────────────────── */}
        <View style={styles.brandSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🏢</Text>
          </View>
          <Text style={styles.appTitle}>Attendance</Text>
          <Text style={styles.appSubtitle}>Clock in with precision</Text>
        </View>

        {/* ── Form Card ─────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              placeholderTextColor="#64748B"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Enter your password"
                placeholderTextColor="#64748B"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(v => !v)}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginBtnText}>Sign In →</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Powered by HRMS · Attendance Phase 1
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  container: {
    flexGrow: 1, alignItems: 'center',
    justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48,
  },

  brandSection: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#1E293B',
    borderWidth: 2, borderColor: '#6366F1',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  logoEmoji: { fontSize: 32 },
  appTitle: { fontSize: 28, fontWeight: '800', color: '#F1F5F9', letterSpacing: -0.5 },
  appSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },

  card: {
    width: '100%', backgroundColor: '#1E293B',
    borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 20, fontWeight: '700', color: '#F1F5F9', marginBottom: 24,
  },

  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#94A3B8', marginBottom: 6 },
  input: {
    backgroundColor: '#0F172A', borderRadius: 10,
    borderWidth: 1, borderColor: '#334155',
    color: '#F1F5F9', fontSize: 15, paddingHorizontal: 14, paddingVertical: 12,
  },
  passwordWrapper: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeBtn: {
    position: 'absolute', right: 12, top: 12,
    padding: 2,
  },
  eyeIcon: { fontSize: 18 },

  errorBanner: {
    backgroundColor: '#450A0A', borderRadius: 10, padding: 12,
    marginBottom: 16, borderWidth: 1, borderColor: '#7F1D1D',
  },
  errorText: { color: '#FCA5A5', fontSize: 13 },

  loginBtn: {
    backgroundColor: '#6366F1', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },

  footer: { marginTop: 32, color: '#334155', fontSize: 12 },
});
