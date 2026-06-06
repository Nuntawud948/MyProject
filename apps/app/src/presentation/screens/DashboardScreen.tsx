/**
 * @file DashboardScreen.tsx
 * @description Main screen post-login — shows today's attendance status
 * and provides Clock-In (Auto/Manual) + Clock-Out actions.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/AppNavigator';

import { useAuth } from '../hooks/useAuth';
import { useAttendance } from '../hooks/useAttendance';
import { ManualCheckInModal } from '../components/attendance/ManualCheckInModal';

export function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { session, logout } = useAuth();
  const employeeId = session?.employeeId ?? '';
  const {
    todayRecord,
    isClockedIn,
    isLoading,
    error,
    loadTodayStatus,
    clockIn,
    clockOut,
  } = useAttendance(employeeId);

  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ── On mount: load status + acquire GPS ─────────────────────────────────
  useEffect(() => {
    loadTodayStatus();
    acquireLocation();
  }, []);

  const acquireLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Location Required', 'Location access is needed for attendance.');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTodayStatus();
    setRefreshing(false);
  };

  // ── Auto Clock-In ────────────────────────────────────────────────────────
  const handleAutoClockIn = async () => {
    if (!coords) { Alert.alert('Location', 'Acquiring GPS — please wait.'); return; }
    await clockIn({
      employeeId,
      latitude: coords.latitude,
      longitude: coords.longitude,
      checkInMethod: 'Auto',
    });
  };

  // ── Manual Clock-In (via modal) ─────────────────────────────────────────
  const handleManualConfirm = async (reason: string, imageUri: string) => {
    if (!coords) return;
    await clockIn(
      { employeeId, latitude: coords.latitude, longitude: coords.longitude, checkInMethod: 'Manual', reason },
      imageUri,
    );
    setShowManualModal(false);
  };

  // ── Format time ──────────────────────────────────────────────────────────
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              👋 {session?.username ?? 'Employee'}
            </Text>
            <Text style={styles.date}>{today}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Sign out</Text>
          </TouchableOpacity>
        </View>

        {/* ── Status Card ──────────────────────────────────────────────────── */}
        <View style={[styles.statusCard, isClockedIn ? styles.cardIn : styles.cardOut]}>
          <Text style={styles.statusIcon}>{isClockedIn ? '🟢' : '🔴'}</Text>
          <Text style={styles.statusLabel}>
            {isClockedIn ? 'Currently Clocked In' : 'Not Clocked In'}
          </Text>
          {todayRecord && (
            <View style={styles.timePills}>
              <View style={styles.pill}>
                <Text style={styles.pillLabel}>IN</Text>
                <Text style={styles.pillValue}>{formatTime(todayRecord.clockInTime)}</Text>
              </View>
              {todayRecord.clockOutTime && (
                <View style={styles.pill}>
                  <Text style={styles.pillLabel}>OUT</Text>
                  <Text style={styles.pillValue}>{formatTime(todayRecord.clockOutTime)}</Text>
                </View>
              )}
              <View style={styles.pill}>
                <Text style={styles.pillLabel}>METHOD</Text>
                <Text style={[styles.pillValue,
                  todayRecord.checkInMethod === 'Manual' ? styles.pillManual : styles.pillAuto
                ]}>
                  {todayRecord.checkInMethod}
                </Text>
              </View>
            </View>
          )}
          {!todayRecord && !isLoading && (
            <Text style={styles.noRecord}>No attendance record for today.</Text>
          )}
        </View>

        {/* ── GPS Indicator ───────────────────────────────────────────────── */}
        <View style={styles.gpsRow}>
          <Text style={styles.gpsIcon}>{coords ? '📍' : '⏳'}</Text>
          <Text style={styles.gpsText}>
            {coords
              ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
              : 'Acquiring GPS signal…'}
          </Text>
        </View>

        {/* ── Error Banner ─────────────────────────────────────────────────── */}
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        {/* ── Action Buttons ───────────────────────────────────────────────── */}
        {isLoading ? (
          <ActivityIndicator color="#6366F1" size="large" style={{ marginTop: 32 }} />
        ) : !isClockedIn ? (
          <View style={styles.actionSection}>
            <Text style={styles.actionTitle}>Check-In Options</Text>

            <TouchableOpacity
              style={styles.autoBtn}
              onPress={handleAutoClockIn}
              disabled={!coords}
              activeOpacity={0.85}
            >
              <Text style={styles.autoBtnEmoji}>🛰️</Text>
              <View>
                <Text style={styles.autoBtnTitle}>Auto Check-In</Text>
                <Text style={styles.autoBtnSub}>Uses GPS — instant, no approval needed</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.manualBtn}
              onPress={() => setShowManualModal(true)}
              disabled={!coords}
              activeOpacity={0.85}
            >
              <Text style={styles.manualBtnEmoji}>📸</Text>
              <View>
                <Text style={styles.manualBtnTitle}>Manual Check-In</Text>
                <Text style={styles.manualBtnSub}>Photo + reason required · pending approval</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.clockOutBtn}
              onPress={clockOut}
              activeOpacity={0.85}
            >
              <Text style={styles.clockOutBtnText}>🏁  Clock Out</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ── Simulation Preview Button (fixed bottom) ──────────────────────── */}
      <TouchableOpacity
        style={styles.simBtn}
        onPress={() => navigation.navigate('Simulation')}
        activeOpacity={0.85}
      >
        <Text style={styles.simBtnText}>🖥️  Preview App Simulation</Text>
      </TouchableOpacity>

      {/* ── Manual Check-In Modal ────────────────────────────────────────── */}
      <ManualCheckInModal
        visible={showManualModal}
        latitude={coords?.latitude ?? 0}
        longitude={coords?.longitude ?? 0}
        onConfirm={handleManualConfirm}
        onCancel={() => setShowManualModal(false)}
      />
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 40 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 24,
  },
  greeting: { fontSize: 22, fontWeight: '700', color: '#F1F5F9' },
  date: { fontSize: 13, color: '#64748B', marginTop: 2 },
  logoutBtn: {
    backgroundColor: '#1E293B', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1, borderColor: '#334155',
  },
  logoutText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },

  statusCard: {
    borderRadius: 20, padding: 20, marginBottom: 16,
    borderWidth: 1,
  },
  cardIn: { backgroundColor: '#052E16', borderColor: '#166534' },
  cardOut: { backgroundColor: '#1C1917', borderColor: '#292524' },
  statusIcon: { fontSize: 20, marginBottom: 4 },
  statusLabel: { fontSize: 18, fontWeight: '700', color: '#F1F5F9', marginBottom: 16 },
  timePills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  pillLabel: { fontSize: 10, color: '#64748B', fontWeight: '700', letterSpacing: 1 },
  pillValue: { fontSize: 15, fontWeight: '700', color: '#F1F5F9', marginTop: 2 },
  pillAuto: { color: '#34D399' },
  pillManual: { color: '#F59E0B' },
  noRecord: { color: '#64748B', fontSize: 14 },

  gpsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#1E293B', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 16,
  },
  gpsIcon: { fontSize: 14 },
  gpsText: { fontSize: 12, color: '#64748B', fontFamily: 'monospace', flex: 1 },

  errorBanner: {
    backgroundColor: '#450A0A', borderRadius: 10, padding: 12,
    marginBottom: 16, borderWidth: 1, borderColor: '#7F1D1D',
  },
  errorText: { color: '#FCA5A5', fontSize: 13 },

  actionSection: { gap: 12 },
  actionTitle: { fontSize: 13, fontWeight: '700', color: '#64748B', letterSpacing: 1, marginBottom: 4 },

  autoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: '#1E3A5F', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: '#1E40AF',
  },
  autoBtnEmoji: { fontSize: 28 },
  autoBtnTitle: { fontSize: 16, fontWeight: '700', color: '#F1F5F9' },
  autoBtnSub: { fontSize: 12, color: '#93C5FD', marginTop: 2 },

  manualBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: '#1C1407', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: '#92400E',
  },
  manualBtnEmoji: { fontSize: 28 },
  manualBtnTitle: { fontSize: 16, fontWeight: '700', color: '#F1F5F9' },
  manualBtnSub: { fontSize: 12, color: '#FCD34D', marginTop: 2 },

  clockOutBtn: {
    backgroundColor: '#7F1D1D', borderRadius: 16,
    paddingVertical: 20, alignItems: 'center',
    borderWidth: 1, borderColor: '#DC2626',
  },
  clockOutBtnText: { color: '#FFF', fontWeight: '800', fontSize: 18 },

  simBtn: {
    backgroundColor: '#1E293B',
    borderTopWidth: 1, borderTopColor: '#334155',
    paddingVertical: 14, alignItems: 'center',
  },
  simBtnText: { color: '#818CF8', fontWeight: '700', fontSize: 14 },
});
