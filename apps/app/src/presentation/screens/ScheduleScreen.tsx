/**
 * @file ScheduleScreen.tsx
 * @description Screen displaying the employee's work schedule, holidays, leave periods, and upcoming events.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../theme';
import { useAuth } from '../context/AuthContext';

export function ScheduleScreen() {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [currentYear, setCurrentYear] = useState(2024);
  const [currentMonth, setCurrentMonth] = useState(6); // July (0-indexed)

  const userAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMkTtQ960cOCGlzHxlU1cbnc8LaSU2dtSIzg0tH8Jid5W3ZFFu25NYOKQJAZzD0juYjZbkwSiTpli33CewD4Lsole7MW_eCBNFHcXjGtKQ5Xr4V9YIVyb5OkBaqX88W2-ch0-ZEtTtHehhhMbwL-Ak5KGagrR6LtuQGKwRhr1x5ly2GJhah3uIZrsuR6hQL3YshSsHVPrq07ccn2iwCEUxQG8yRmeUDinvz6VI7oiTcNdBt9mUFI_k0Dwcx5qyDsDl8r1D696BXqI';

  // July 2024 starts on Monday (index 1)
  const daysInJuly = 31;
  const firstDayOffset = 1; // 1 offset empty box

  // Create grid item list
  const daysGrid: (number | null)[] = [];
  for (let i = 0; i < firstDayOffset; i++) {
    daysGrid.push(null);
  }
  for (let i = 1; i <= daysInJuly; i++) {
    daysGrid.push(i);
  }

  const handleDayPress = (day: number) => {
    // Basic interaction feedback
  };

  const getDayStyle = (day: number | null) => {
    if (day === null) return null;
    if (day === 4) return styles.holidayDay;
    if (day === 15) return styles.leaveDayStart;
    if (day >= 16 && day <= 18) return styles.leaveDayMiddle;
    if (day === 19) return styles.leaveDayEnd;
    if (day === 23) return styles.selectedDay;
    return null;
  };

  const getDayTextStyle = (day: number | null) => {
    if (day === null) return null;
    if (day === 4) return styles.holidayDayText;
    if (day >= 15 && day <= 19) return styles.leaveDayText;
    return null;
  };

  return (
    <View style={styles.root}>
      {/* ── TopAppBar ──────────────────────────────────────────────────── */}
      <View style={[styles.topAppBar, { paddingTop: insets.top, height: Theme.spacing.touchTarget + insets.top }]}>
        <View style={styles.userInfo}>
          <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
          <Text style={styles.appBarTitle}>Schedule</Text>
        </View>
        <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
          <MaterialIcons name="notifications" size={24} color={Theme.colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}>
        {/* ── Calendar Section ────────────────────────────────────────────── */}
        <View style={[styles.calendarCard, Theme.elevation.level1]}>
          <View style={styles.calendarHeader}>
            <Text style={styles.monthLabel}>July 2024</Text>
            <View style={styles.calendarNavRow}>
              <TouchableOpacity style={styles.navBtn}>
                <MaterialIcons name="chevron-left" size={24} color={Theme.colors.onSurface} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn}>
                <MaterialIcons name="chevron-right" size={24} color={Theme.colors.onSurface} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Day Names */}
          <View style={styles.weekdayRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, index) => (
              <Text key={`wk-${index}`} style={styles.weekdayText}>{d}</Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.calendarGrid}>
            {daysGrid.map((day, index) => {
              if (day === null) {
                return <View key={`empty-${index}`} style={styles.emptyDay} />;
              }

              const customStyle = getDayStyle(day);
              const customTextStyle = getDayTextStyle(day);

              return (
                <TouchableOpacity
                  key={`day-${day}`}
                  style={[styles.dayCell, customStyle]}
                  onPress={() => handleDayPress(day)}
                  disabled={day === null}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayText, customTextStyle]}>{day}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Theme.colors.tertiaryContainer }]} />
              <Text style={styles.legendText}>Government Holidays</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Theme.colors.primaryContainer }]} />
              <Text style={styles.legendText}>My Leave</Text>
            </View>
          </View>
        </View>

        {/* ── Events List ────────────────────────────────────────────────── */}
        <View style={styles.eventsSection}>
          <Text style={styles.eventsTitle}>Upcoming in July</Text>

          {/* Event Card 1 */}
          <TouchableOpacity
            style={[styles.eventCard, Theme.elevation.level1]}
            activeOpacity={0.8}
          >
            <View style={[styles.eventBadge, { backgroundColor: Theme.colors.tertiaryContainer }]}>
              <Text style={[styles.eventMonth, { color: Theme.colors.onTertiaryContainer }]}>Jul</Text>
              <Text style={[styles.eventDayNum, { color: Theme.colors.onTertiaryContainer }]}>04</Text>
            </View>
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>Independence Day</Text>
              <Text style={styles.eventSub}>Public Holiday • Office Closed</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Theme.colors.outline} />
          </TouchableOpacity>

          {/* Event Card 2 */}
          <TouchableOpacity
            style={[styles.eventCard, Theme.elevation.level1]}
            activeOpacity={0.8}
          >
            <View style={[styles.eventBadge, { backgroundColor: Theme.colors.primaryContainer }]}>
              <Text style={[styles.eventMonth, { color: Theme.colors.onPrimaryContainer }]}>Jul</Text>
              <Text style={[styles.eventDayNum, { color: Theme.colors.onPrimaryContainer }]}>15</Text>
            </View>
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>Annual Leave Begins</Text>
              <Text style={styles.eventSub}>5 days • Vacation in Hawaii</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Theme.colors.outline} />
          </TouchableOpacity>

          {/* Event Card 3 */}
          <TouchableOpacity
            style={[styles.eventCard, Theme.elevation.level1]}
            activeOpacity={0.8}
          >
            <View style={[styles.eventBadge, { backgroundColor: Theme.colors.secondaryContainer }]}>
              <Text style={[styles.eventMonth, { color: Theme.colors.onSecondaryContainer }]}>Jul</Text>
              <Text style={[styles.eventDayNum, { color: Theme.colors.onSecondaryContainer }]}>23</Text>
            </View>
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>Quarterly Review</Text>
              <Text style={styles.eventSub}>10:00 AM - 11:30 AM • Conf Room B</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Theme.colors.outline} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── BottomNavBar ───────────────────────────────────────────────── */}
      <View style={[styles.bottomNavBar, { paddingBottom: insets.bottom, height: 64 + insets.bottom }]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Dashboard')}
          activeOpacity={0.8}
        >
          <MaterialIcons name="dashboard" size={22} color={Theme.colors.onSurfaceVariant} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navItem, styles.navItemActive]} activeOpacity={0.8}>
          <MaterialIcons name="calendar-today" size={22} color={Theme.colors.primary} />
          <Text style={[styles.navText, styles.navTextActive]}>Schedule</Text>
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
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.surfaceContainerHigh,
  },
  appBarTitle: {
    fontSize: Theme.typography.headlineMd.fontSize,
    fontFamily: Theme.typography.headlineMd.fontFamily,
    fontWeight: '600',
    color: Theme.colors.primary,
  },
  bellButton: {
    padding: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.marginMobile,
    paddingTop: 24,
    paddingBottom: 100,
  },
  calendarCard: {
    backgroundColor: Theme.colors.surfaceContainerLowest,
    borderRadius: Theme.rounded.xl,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 214, 0.3)',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthLabel: {
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
    fontWeight: '700',
    color: Theme.colors.onSurface,
  },
  calendarNavRow: {
    flexDirection: 'row',
    gap: 8,
  },
  navBtn: {
    padding: 4,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  weekdayText: {
    width: 38,
    textAlign: 'center',
    fontSize: Theme.typography.labelLg.fontSize,
    fontFamily: Theme.typography.labelLg.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    rowGap: 8,
  },
  emptyDay: {
    width: 38,
    height: 38,
    margin: 2,
  },
  dayCell: {
    width: 38,
    height: 38,
    margin: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  dayText: {
    fontSize: Theme.typography.bodyMd.fontSize,
    fontFamily: Theme.typography.bodyMd.fontFamily,
    color: Theme.colors.onSurface,
  },
  holidayDay: {
    backgroundColor: Theme.colors.tertiaryContainer,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: Theme.colors.surfaceContainerLowest,
  },
  holidayDayText: {
    color: Theme.colors.onTertiaryContainer,
    fontWeight: '700',
  },
  leaveDayStart: {
    backgroundColor: Theme.colors.primaryContainer,
    borderTopLeftRadius: 19,
    borderBottomLeftRadius: 19,
    borderRadius: 0,
  },
  leaveDayMiddle: {
    backgroundColor: Theme.colors.primaryContainer,
    borderRadius: 0,
  },
  leaveDayEnd: {
    backgroundColor: Theme.colors.primaryContainer,
    borderTopRightRadius: 19,
    borderBottomRightRadius: 19,
    borderRadius: 0,
  },
  leaveDayText: {
    color: Theme.colors.onPrimaryContainer,
    fontWeight: '700',
  },
  selectedDay: {
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    borderRadius: 19,
  },
  legendContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.outlineVariant,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: Theme.typography.labelLg.fontSize,
    fontFamily: Theme.typography.labelLg.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  eventsSection: {
    gap: 12,
  },
  eventsTitle: {
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
    fontWeight: '600',
    color: Theme.colors.onSurface,
    paddingHorizontal: 4,
  },
  eventCard: {
    backgroundColor: Theme.colors.surfaceContainerLowest,
    borderRadius: Theme.rounded.xl,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 214, 0.2)',
  },
  eventBadge: {
    width: 48,
    height: 48,
    borderRadius: Theme.rounded.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventMonth: {
    fontSize: Theme.typography.labelMd.fontSize,
    fontFamily: Theme.typography.labelMd.fontFamily,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  eventDayNum: {
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
    fontWeight: '700',
    lineHeight: 20,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
    color: Theme.colors.onSurface,
    fontWeight: '700',
  },
  eventSub: {
    fontSize: Theme.typography.bodyMd.fontSize,
    fontFamily: Theme.typography.bodyMd.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    marginTop: 2,
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
