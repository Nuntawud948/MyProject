/**
 * @file DashboardScreen.tsx
 * @description Main screen post-login — shows today's attendance status,
 * map visualization with geofencing, Check-In/Out action triggers, and today's activity.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
  ImageBackground,
  Animated,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/AppNavigator';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { useAttendance } from '../hooks/useAttendance';
import { ManualCheckInModal } from '../components/attendance/ManualCheckInModal';
import { Theme } from '../theme';

export function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { session, logout } = useAuth();
  const employeeId = session?.employeeId ?? '';
  const insets = useSafeAreaInsets();
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
  const [currentDateTime, setCurrentDateTime] = useState('');

  // Geofence Pulse Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ── Date/Time Tick ───────────────────────────────────────────────────────
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      const formatted = now.toLocaleDateString('en-US', options).replace(',', ' •');
      setCurrentDateTime(formatted);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // ── Pulse Loop ───────────────────────────────────────────────────────────
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // ── On mount: load status + acquire GPS ─────────────────────────────────
  useEffect(() => {
    if (employeeId) {
      loadTodayStatus();
    }
    acquireLocation();
  }, [employeeId, loadTodayStatus]);

  const acquireLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Location Required', 'Location access is needed for attendance.');
      return;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch (err) {
      console.log('Error acquiring location:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadTodayStatus(), acquireLocation()]);
    setRefreshing(false);
  };

  // ── Auto Clock-In ────────────────────────────────────────────────────────
  const handleAutoClockIn = async () => {
    if (!coords) {
      Alert.alert('Location', 'Acquiring GPS — please wait.');
      return;
    }
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

  // ── Format time utilities ────────────────────────────────────────────────
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const getExpectedDeparture = () => {
    if (todayRecord?.clockInTime) {
      const inTime = new Date(todayRecord.clockInTime);
      inTime.setHours(inTime.getHours() + 8);
      return inTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return '05:45 PM';
  };

  // Default fallback user image
  const userAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMkTtQ960cOCGlzHxlU1cbnc8LaSU2dtSIzg0tH8Jid5W3ZFFu25NYOKQJAZzD0juYjZbkwSiTpli33CewD4Lsole7MW_eCBNFHcXjGtKQ5Xr4V9YIVyb5OkBaqX88W2-ch0-ZEtTtHehhhMbwL-Ak5KGagrR6LtuQGKwRhr1x5ly2GJhah3uIZrsuR6hQL3YshSsHVPrq07ccn2iwCEUxQG8yRmeUDinvz6VI7oiTcNdBt9mUFI_k0Dwcx5qyDsDl8r1D696BXqI';

  // Map background mockup URL
  const mapBackground = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtdgbSY5MUVQev9qkyWE7JYinkuuT4FRb6rfTPUGqeS-z4073C_mxPb8YQOol-16z8uEYFkGwSe0pdtUrZzc8Zl9P68loogsvfzLt9wtdHbFD_K0ICw95iSM-qEpL7GS6hzRbwLcDPjKf1DCAj1lsY647Ete8vUgZek0EiECdaGkWlWlj6Z4XJIrWZDNEi8tSMkbULD2JGkuyxB2khJqZamnZ42LVAeGQDk2WjXBlqdU9UIzjgzmcTs9Q1WVJpFYBa_OLH0JFDHD0';

  return (
    <View style={styles.root}>
      {/* ── TopAppBar ──────────────────────────────────────────────────── */}
      <View style={[styles.topAppBar, { paddingTop: insets.top, height: Theme.spacing.touchTarget + insets.top }]}>
        <View style={styles.userInfo}>
          <View style={styles.avatarBorder}>
            <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
          </View>
          <View style={styles.userTextContainer}>
            <Text style={styles.userName}>{session?.username ?? 'Alex Johnson'}</Text>
            <Text style={styles.userDateTime}>{currentDateTime || 'Loading...'}</Text>
          </View>
        </View>
        <View style={styles.appBarActions}>
          <TouchableOpacity
            style={styles.simPreviewLink}
            onPress={() => navigation.navigate('Simulation')}
            activeOpacity={0.7}
          >
            <MaterialIcons name="settings" size={20} color={Theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
            <MaterialIcons name="notifications" size={24} color={Theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Theme.colors.primary}
          />
        }
      >
        {/* ── Geofence Map Card ───────────────────────────────────────────── */}
        <View style={[styles.mapCard, Theme.elevation.level1]}>
          <ImageBackground
            source={{ uri: mapBackground }}
            style={styles.mapBackground}
            imageStyle={styles.mapBackgroundImage}
          >
            {/* Geofence Pulse Animation overlay */}
            <View style={styles.geofenceContainer}>
              <Animated.View
                style={[
                  styles.geofenceCircle,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
              <View style={styles.gpsDot} />
            </View>

            {/* Floating Geofence Tag */}
            <View style={styles.geofenceTag}>
              <View style={styles.geofenceTagDot} />
              <Text style={styles.geofenceTagText}>Office Geofence</Text>
            </View>
          </ImageBackground>

          {/* Map Footer Status bar */}
          <View style={styles.mapStatusBar}>
            <View style={styles.statusInsideContainer}>
              <MaterialIcons
                name="check-circle"
                size={22}
                color={Theme.colors.success}
              />
              <Text style={styles.statusInsideText}>Inside Geofence</Text>
            </View>
            <TouchableOpacity
              onPress={acquireLocation}
              style={styles.refreshButton}
              activeOpacity={0.7}
            >
              <MaterialIcons name="refresh" size={18} color={Theme.colors.primary} />
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Action Section: Check-In/Out ─────────────────────────────────── */}
        <View style={styles.actionsContainer}>
          <View style={styles.checkInOutRow}>
            {/* Check-In Button */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.checkInBtn,
                (isClockedIn || isLoading) && styles.btnDisabled,
              ]}
              onPress={handleAutoClockIn}
              disabled={isClockedIn || isLoading}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name="login"
                size={22}
                color={isClockedIn ? Theme.colors.outline : Theme.colors.onPrimary}
              />
              <Text
                style={[
                  styles.actionBtnText,
                  { color: isClockedIn ? Theme.colors.outline : Theme.colors.onPrimary },
                ]}
              >
                Check-In
              </Text>
            </TouchableOpacity>

            {/* Check-Out Button */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.checkOutBtn,
                (!isClockedIn || isLoading) && styles.btnDisabled,
              ]}
              onPress={clockOut}
              disabled={!isClockedIn || isLoading}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name="logout"
                size={22}
                color={isClockedIn ? Theme.colors.onSurface : Theme.colors.outline}
              />
              <Text
                style={[
                  styles.actionBtnText,
                  { color: isClockedIn ? Theme.colors.onSurface : Theme.colors.outline },
                ]}
              >
                Check-Out
              </Text>
            </TouchableOpacity>
          </View>

          {/* Manual Request Button */}
          <TouchableOpacity
            style={styles.manualRequestBtn}
            onPress={() => setShowManualModal(true)}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name="location-off"
              size={22}
              color={Theme.colors.onSurfaceVariant}
            />
            <Text style={styles.manualRequestBtnText}>Manual Request</Text>
          </TouchableOpacity>

          {/* Apply for Leave Button */}
          <TouchableOpacity
            style={styles.applyLeaveBtn}
            onPress={() => navigation.navigate('ApplyForLeave')}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name="calendar-month"
              size={22}
              color={Theme.colors.onSurfaceVariant}
            />
            <Text style={styles.applyLeaveBtnText}>Apply for Leave</Text>
          </TouchableOpacity>
        </View>

        {/* Error Banner */}
        {error ? (
          <View style={styles.errorBanner}>
            <MaterialIcons name="error-outline" size={18} color={Theme.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ── Today's Activity ────────────────────────────────────────────── */}
        <View style={styles.activitySection}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Today's Activity</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityList}>
            {/* Clock-In Activity */}
            {todayRecord ? (
              <View style={[styles.activityCard, styles.activityCardSolid]}>
                <View style={styles.activityLeft}>
                  <View style={styles.activityIconBoxGreen}>
                    <MaterialIcons name="sensor-door" size={22} color={Theme.colors.success} />
                  </View>
                  <View>
                    <Text style={styles.activityNameText}>Checked In</Text>
                    <Text style={styles.activitySubText}>
                      {todayRecord.checkInMethod === 'Manual' ? 'Manual Check-in' : 'Office Tower A'}
                    </Text>
                  </View>
                </View>
                <View style={styles.activityRight}>
                  <Text style={styles.activityTimeText}>
                    {formatTime(todayRecord.clockInTime)}
                  </Text>
                  <View style={styles.verifiedBadge}>
                    <View style={styles.verifiedDot} />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={[styles.activityCard, styles.activityCardSolid]}>
                <View style={styles.activityLeft}>
                  <View style={styles.activityIconBoxGray}>
                    <MaterialIcons name="info-outline" size={22} color={Theme.colors.outline} />
                  </View>
                  <View>
                    <Text style={styles.activityNameText}>No Clock-In Yet</Text>
                    <Text style={styles.activitySubText}>Please clock in to start your shift</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Expected Departure Card */}
            <View style={[styles.activityCard, styles.activityCardDashed]}>
              <View style={[styles.activityLeft, { opacity: 0.6 }]}>
                <View style={styles.activityIconBoxGray}>
                  <MaterialIcons name="timer" size={22} color={Theme.colors.outline} />
                </View>
                <View>
                  <Text style={styles.activityNameText}>Expected Departure</Text>
                  <Text style={styles.activitySubText}>Based on 8h shift</Text>
                </View>
              </View>
              <View style={[styles.activityRight, { opacity: 0.6 }]}>
                <Text style={styles.activityTimeText}>{getExpectedDeparture()}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── BottomNavBar ───────────────────────────────────────────────── */}
      <View style={[styles.bottomNavBar, { paddingBottom: insets.bottom, height: 64 + insets.bottom }]}>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]} activeOpacity={0.8}>
          <MaterialIcons name="dashboard" size={22} color={Theme.colors.primary} />
          <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Schedule')}
          activeOpacity={0.8}
        >
          <MaterialIcons name="calendar-today" size={22} color={Theme.colors.onSurfaceVariant} />
          <Text style={styles.navText}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('LeaveDetails')}
          activeOpacity={0.8}
        >
          <MaterialIcons name="history" size={22} color={Theme.colors.onSurfaceVariant} />
          <Text style={styles.navText}>Records</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
        >
          <MaterialIcons name="person" size={22} color={Theme.colors.onSurfaceVariant} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>

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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  topAppBar: {
    height: Theme.spacing.touchTarget,
    backgroundColor: Theme.colors.surfaceContainerLow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.marginMobile,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.outlineVariant,
    ...Platform.select({
      ios: {
        paddingTop: 0,
      },
    }),
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBorder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Theme.colors.outlineVariant,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userTextContainer: {
    flexDirection: 'column',
  },
  userName: {
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
    fontWeight: '600',
    color: Theme.colors.onSurface,
  },
  userDateTime: {
    fontSize: Theme.typography.labelMd.fontSize,
    fontFamily: Theme.typography.labelMd.fontFamily,
    color: Theme.colors.onSurfaceVariant,
  },
  appBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  simPreviewLink: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  bellButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.marginMobile,
    paddingTop: 24,
    paddingBottom: 100, // extra spacing for custom navbar
  },
  mapCard: {
    backgroundColor: Theme.colors.surfaceContainerLowest,
    borderRadius: Theme.rounded.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 214, 0.3)',
    marginBottom: 20,
  },
  mapBackground: {
    height: 250,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapBackgroundImage: {
    opacity: 0.8,
  },
  geofenceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  geofenceCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(21, 128, 61, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(21, 128, 61, 0.35)',
    position: 'absolute',
  },
  gpsDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Theme.colors.primary,
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  geofenceTag: {
    position: 'absolute',
    bottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Theme.rounded.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Theme.colors.outlineVariant,
  },
  geofenceTagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.success,
  },
  geofenceTagText: {
    fontSize: Theme.typography.labelMd.fontSize,
    fontFamily: Theme.typography.labelMd.fontFamily,
    color: Theme.colors.onSurface,
    fontWeight: '500',
  },
  mapStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Theme.colors.surfaceContainerLow,
  },
  statusInsideContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusInsideText: {
    fontSize: Theme.typography.bodyLg.fontSize,
    fontFamily: Theme.typography.bodyLg.fontFamily,
    color: Theme.colors.onSurface,
    fontWeight: '500',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  refreshText: {
    fontSize: Theme.typography.labelLg.fontSize,
    fontFamily: Theme.typography.labelLg.fontFamily,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  checkInOutRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: Theme.spacing.touchTarget,
    borderRadius: Theme.rounded.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkInBtn: {
    backgroundColor: Theme.colors.primary,
  },
  checkOutBtn: {
    borderWidth: 2,
    borderColor: Theme.colors.outlineVariant,
    backgroundColor: 'transparent',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  actionBtnText: {
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
    fontWeight: '600',
  },
  manualRequestBtn: {
    width: '100%',
    height: Theme.spacing.touchTarget,
    borderRadius: Theme.rounded.full,
    borderWidth: 2,
    borderColor: Theme.colors.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  manualRequestBtnText: {
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    fontWeight: '600',
  },
  applyLeaveBtn: {
    width: '100%',
    height: Theme.spacing.touchTarget,
    borderRadius: Theme.rounded.full,
    borderWidth: 2,
    borderColor: Theme.colors.outlineVariant,
    backgroundColor: Theme.colors.surfaceContainerLow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  applyLeaveBtnText: {
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
    color: Theme.colors.primary,
    fontWeight: '600',
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
  activitySection: {
    gap: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityTitle: {
    fontSize: Theme.typography.headlineMd.fontSize,
    fontFamily: Theme.typography.headlineMd.fontFamily,
    fontWeight: '600',
    color: Theme.colors.onSurface,
  },
  viewAllText: {
    fontSize: Theme.typography.labelLg.fontSize,
    fontFamily: Theme.typography.labelLg.fontFamily,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  activityList: {
    gap: 12,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: Theme.rounded.xl,
  },
  activityCardSolid: {
    backgroundColor: Theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activityCardDashed: {
    backgroundColor: Theme.colors.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: Theme.colors.outlineVariant,
    borderStyle: 'dashed',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIconBoxGreen: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(21, 128, 61, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIconBoxGray: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityNameText: {
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
    fontWeight: '600',
    color: Theme.colors.onSurface,
  },
  activitySubText: {
    fontSize: Theme.typography.labelLg.fontSize,
    fontFamily: Theme.typography.labelLg.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityTimeText: {
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
    fontWeight: '600',
    color: Theme.colors.primary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  verifiedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.success,
  },
  verifiedText: {
    fontSize: Theme.typography.labelMd.fontSize,
    fontFamily: Theme.typography.labelMd.fontFamily,
    color: Theme.colors.success,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bottomNavBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: Theme.colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.outlineVariant,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 12 : 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: Theme.rounded.full,
  },
  navItemActive: {
    backgroundColor: Theme.colors.primaryFixed,
  },
  navText: {
    fontSize: Theme.typography.labelMd.fontSize,
    fontFamily: Theme.typography.labelMd.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    marginTop: 2,
    fontWeight: '500',
  },
  navTextActive: {
    color: Theme.colors.onPrimaryFixedVariant,
    fontWeight: '600',
  },
});

