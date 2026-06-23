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
import { WebView } from 'react-native-webview';

import { useAuth } from '../context/AuthContext';
import { useAttendance } from '../hooks/useAttendance';
import { SecureCheckIn } from '../components/SecureCheckIn';
import { ManualCheckInModal } from '../components/attendance/ManualCheckInModal';
import { ConfirmationDialog } from '../components/attendance/ConfirmationDialog';
import { SelfieModal } from '../components/attendance/SelfieModal';
import { Theme } from '../theme';
import { getActiveGeofences } from '../../data/apis/attendance.api';
import type { GeofenceResponse } from '../../data/dtos/attendance/geofence.response';

const DEFAULT_GEOFENCES: GeofenceResponse[] = [
  {
    id: 1,
    name: "Headquarters Office",
    latitude: 13.7563,
    longitude: 100.5018,
    radiusInMeters: 150,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  },
  {
    id: 2,
    name: "Suburban Warehouse",
    latitude: 13.6593,
    longitude: 100.4018,
    radiusInMeters: 300,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  }
];


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
  const [selfieContext, setSelfieContext] = useState<'clockIn' | 'clockOut' | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');
  
  const [geofences, setGeofences] = useState<GeofenceResponse[]>([]);
  const [isInsideAnyGeofence, setIsInsideAnyGeofence] = useState(false);
  const [nearestGeofence, setNearestGeofence] = useState<GeofenceResponse | null>(null);

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

  const fetchGeofences = async () => {
    try {
      const res = await getActiveGeofences();
      const activeFences = (res.items || []).filter(f => f.isActive);
      if (activeFences.length === 0) {
        setGeofences(DEFAULT_GEOFENCES);
        return DEFAULT_GEOFENCES;
      }
      setGeofences(activeFences);
      return activeFences;
    } catch (err) {
      console.log('Error fetching active geofences, using mock data:', err);
      setGeofences(DEFAULT_GEOFENCES);
      return DEFAULT_GEOFENCES;
    }
  };

  const getDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
  };

  useEffect(() => {
    if (coords && geofences.length > 0) {
      let inside = false;
      let minDistance = Infinity;
      let nearest: GeofenceResponse | null = null;

      geofences.forEach(fence => {
        const dist = getDistanceInMeters(coords.latitude, coords.longitude, fence.latitude, fence.longitude);
        if (dist <= fence.radiusInMeters) {
          inside = true;
        }
        if (dist < minDistance) {
          minDistance = dist;
          nearest = fence;
        }
      });

      setIsInsideAnyGeofence(inside);
      setNearestGeofence(nearest);
    } else {
      setIsInsideAnyGeofence(false);
      setNearestGeofence(null);
    }
  }, [coords, geofences]);

  // ── On mount & on screen focus: load status + acquire GPS ────────────────
  useEffect(() => {
    if (employeeId) {
      loadTodayStatus();
    }
    acquireLocation();
    fetchGeofences();

    // Listen to screen focus events to reload status automatically when returning to home page
    const unsubscribe = navigation.addListener('focus', () => {
      if (employeeId) {
        loadTodayStatus();
        acquireLocation();
        fetchGeofences();
      }
    });

    return unsubscribe;
  }, [employeeId, loadTodayStatus, navigation]);

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
    await Promise.all([loadTodayStatus(), acquireLocation(), fetchGeofences()]);
    setRefreshing(false);
  };

  // ── Auto Clock-In (Show Confirmation) ────────────────────────────────────
  const handleAutoClockIn = () => {
    if (!coords) {
      Alert.alert('Location', 'Acquiring GPS — please wait.');
      return;
    }

    if (!isInsideAnyGeofence) {
      Alert.alert(
        'Outside Geofence',
        'Auto Check-In is permitted only if you are within an active geofence. For off-site check-in, please use the "Manual Request" option.',
        [{ text: 'OK' }]
      );
      return;
    }

    setSelfieContext('clockIn');
  };

  const executeAutoClockIn = async (imageUri: string) => {
    setSelfieContext(null);
    if (!coords) return;
    await clockIn({
      employeeId,
      latitude: coords.latitude,
      longitude: coords.longitude,
      checkInMethod: 'Auto',
    }, imageUri);
  };

  const handleClockOut = () => {
    setSelfieContext('clockOut');
  };

  const executeClockOut = async (imageUri: string) => {
    setSelfieContext(null);
    await clockOut(imageUri);
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
          {!coords ? (
            <View style={[styles.mapBackground, { backgroundColor: Theme.colors.surfaceContainer, justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color={Theme.colors.primary} />
              <Text style={{ marginTop: 8, color: Theme.colors.onSurfaceVariant, fontFamily: Theme.typography.bodyMd.fontFamily }}>
                Acquiring GPS Location...
              </Text>
            </View>
          ) : (
            <View style={{ height: 250, width: '100%' }}>
              <WebView
                originWhitelist={['*']}
                source={{
                  html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta charset="utf-8" />
                      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                      <style>
                        html, body, #map { height: 100%; margin: 0; padding: 0; background: #f0f0f0; }
                        .user-pulse {
                          width: 14px;
                          height: 14px;
                          background-color: ${Theme.colors.primary};
                          border: 3px solid white;
                          border-radius: 50%;
                          box-shadow: 0 0 8px ${Theme.colors.primary};
                          animation: pulse 2s infinite;
                        }
                        @keyframes pulse {
                          0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(0, 122, 255, 0.7); }
                          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(0, 122, 255, 0); }
                          100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(0, 122, 255, 0); }
                        }
                      </style>
                    </head>
                    <body>
                      <div id="map"></div>
                      <script>
                        var map = L.map('map', { zoomControl: false }).setView([${coords.latitude}, ${coords.longitude}], 15);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                          maxZoom: 19,
                          attribution: '© OpenStreetMap'
                        }).addTo(map);

                        // User Location Marker (Person Icon Style)
                        var personIcon = L.divIcon({
                          className: 'person-marker',
                          html: '<div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background-color: #3b82f6; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>',
                          iconSize: [32, 32],
                          iconAnchor: [16, 16]
                        });
                        var userMarker = L.marker([${coords.latitude}, ${coords.longitude}], { icon: personIcon }).addTo(map);

                        // Geofences
                        var fences = ${JSON.stringify(geofences)};
                        fences.forEach(function(fence) {
                          // Circle overlay for geofences
                          L.circle([fence.latitude, fence.longitude], {
                            color: '#2563eb',
                            fillColor: '#3b82f6',
                            fillOpacity: 0.15,
                            radius: fence.radiusInMeters
                          }).addTo(map);

                          L.marker([fence.latitude, fence.longitude], {
                            icon: L.divIcon({
                              className: 'fence-label',
                              html: '<div style="background: white; border: 1px solid #2563eb; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-family: sans-serif; font-weight: bold; white-space: nowrap; color: #2563eb; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">' + fence.name + ' (' + fence.radiusInMeters + 'm)</div>',
                              iconSize: [120, 20],
                              iconAnchor: [60, -10]
                            })
                          }).addTo(map);
                        });
                      </script>
                    </body>
                    </html>
                  `
                }}
                style={{ flex: 1 }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
              />
            </View>
          )}

          {/* Map Footer Status bar */}
          <View style={styles.mapStatusBar}>
            <View style={styles.statusInsideContainer}>
              <MaterialIcons
                name={isInsideAnyGeofence ? "check-circle" : "error"}
                size={22}
                color={isInsideAnyGeofence ? Theme.colors.success : Theme.colors.error}
              />
              <Text style={styles.statusInsideText}>
                {isInsideAnyGeofence
                  ? `Inside ${nearestGeofence ? nearestGeofence.name : 'Geofence'}`
                  : "Outside Approved Fences"
                }
              </Text>
            </View>
          </View>
        </View>

        {/* ── Action Section: Check-In/Out ─────────────────────────────────── */}
        <View style={styles.actionsContainer}>
          <View style={styles.checkInOutRow}>
            {/* Check-In Button (Secure) */}
            <SecureCheckIn
              isClockedIn={isClockedIn}
              isLoading={isLoading}
              onCheckInAllowed={handleAutoClockIn}
              onSecurityBlock={() => setCoords(null)}
            />

            {/* Check-Out Button */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.checkOutBtn,
                (!isClockedIn || isLoading) && styles.btnDisabled,
              ]}
              onPress={handleClockOut}
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
                    {formatTime(todayRecord.clockInTime)} - {todayRecord.clockOutTime ? formatTime(todayRecord.clockOutTime) : '-'}
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
          onPress={() => navigation.navigate('LeaveDetails', { id: undefined })}
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

      {/* ── Auto Check-In / Check-Out Selfie Modal ───────────────────────── */}
      <SelfieModal
        visible={selfieContext !== null}
        title={selfieContext === 'clockIn' ? "Check-In Verification" : "Check-Out Verification"}
        subtitle={`Please capture a selfie to confirm your ${selfieContext === 'clockIn' ? 'Check-In' : 'Check-Out'}.\n${selfieContext === 'clockIn' && nearestGeofence ? `Zone: ${nearestGeofence.name}` : ''}`}
        onConfirm={selfieContext === 'clockIn' ? executeAutoClockIn : executeClockOut}
        onCancel={() => setSelfieContext(null)}
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

