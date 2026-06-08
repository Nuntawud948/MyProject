/**
 * @file ScheduleScreen.tsx
 * @description Screen displaying the employee's work schedule, holidays, leave periods, and upcoming events.
 */

import React, { useState, useEffect } from 'react';
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
import { getCompanyHolidaysByYear } from '../../data/apis/companyHoliday.api';
import { CompanyHolidayResponse } from '../../data/dtos/attendance/company-holiday.response';

export function ScheduleScreen() {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(6); // July (0-indexed)
  const [holidays, setHolidays] = useState<CompanyHolidayResponse[]>([]);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const data = await getCompanyHolidaysByYear(currentYear);
        setHolidays(data.filter(h => h.isActive));
      } catch (error) {
        console.error('Failed to load holidays in ScheduleScreen:', error);
      }
    };
    fetchHolidays();
  }, [currentYear]);

  const userAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMkTtQ960cOCGlzHxlU1cbnc8LaSU2dtSIzg0tH8Jid5W3ZFFu25NYOKQJAZzD0juYjZbkwSiTpli33CewD4Lsole7MW_eCBNFHcXjGtKQ5Xr4V9YIVyb5OkBaqX88W2-ch0-ZEtTtHehhhMbwL-Ak5KGagrR6LtuQGKwRhr1x5ly2GJhah3uIZrsuR6hQL3YshSsHVPrq07ccn2iwCEUxQG8yRmeUDinvz6VI7oiTcNdBt9mUFI_k0Dwcx5qyDsDl8r1D696BXqI';

  // Dynamically calculate days in the selected month & year
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Dynamically calculate first day offset (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOffset = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOffset = getFirstDayOffset(currentYear, currentMonth);

  // Create grid item list
  const daysGrid: (number | null)[] = [];
  for (let i = 0; i < firstDayOffset; i++) {
    daysGrid.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysGrid.push(i);
  }

  const handleDayPress = (day: number) => {
    // Basic interaction feedback
  };

  const getHolidayForDay = (day: number | null) => {
    if (day === null) return null;
    return holidays.find(h => {
      const hDate = new Date(h.holidayDate);
      return hDate.getFullYear() === currentYear && hDate.getMonth() === currentMonth && hDate.getDate() === day;
    });
  };

  const getDayStyle = (day: number | null) => {
    if (day === null) return null;
    if (getHolidayForDay(day)) return styles.holidayDay;
    if (day === 15 && currentYear === 2024 && currentMonth === 6) return styles.leaveDayStart;
    if (day >= 16 && day <= 18 && currentYear === 2024 && currentMonth === 6) return styles.leaveDayMiddle;
    if (day === 19 && currentYear === 2024 && currentMonth === 6) return styles.leaveDayEnd;
    if (day === 23 && currentYear === 2024 && currentMonth === 6) return styles.selectedDay;
    return null;
  };

  const getDayTextStyle = (day: number | null) => {
    if (day === null) return null;
    if (getHolidayForDay(day)) return styles.holidayDayText;
    if (day >= 15 && day <= 19 && currentYear === 2024 && currentMonth === 6) return styles.leaveDayText;
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
            <Text style={styles.monthLabel}>
              {new Date(currentYear, currentMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <View style={styles.calendarNavRow}>
              <TouchableOpacity 
                style={styles.navBtn}
                onPress={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear(prev => prev - 1);
                  } else {
                    setCurrentMonth(prev => prev - 1);
                  }
                }}
              >
                <MaterialIcons name="chevron-left" size={24} color={Theme.colors.onSurface} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.navBtn}
                onPress={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear(prev => prev + 1);
                  } else {
                    setCurrentMonth(prev => prev + 1);
                  }
                }}
              >
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

              const isHoliday = getHolidayForDay(day);
              const isLeaveStart = day === 15 && currentYear === 2024 && currentMonth === 6;
              const isLeaveMiddle = day >= 16 && day <= 18 && currentYear === 2024 && currentMonth === 6;
              const isLeaveEnd = day === 19 && currentYear === 2024 && currentMonth === 6;
              const isSelected = day === 23 && currentYear === 2024 && currentMonth === 6;

              const customStyle = getDayStyle(day);
              const customTextStyle = getDayTextStyle(day);

              return (
                <TouchableOpacity
                  key={`day-${day}`}
                  style={styles.dayCell}
                  onPress={() => handleDayPress(day)}
                  disabled={day === null}
                  activeOpacity={0.8}
                >
                  {isHoliday || isSelected || isLeaveStart || isLeaveMiddle || isLeaveEnd ? (
                    <View style={[styles.dayHighlight, customStyle]}>
                      <Text style={[styles.dayText, customTextStyle]}>{day}</Text>
                    </View>
                  ) : (
                    <Text style={[styles.dayText, customTextStyle]}>{day}</Text>
                  )}
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
          <Text style={styles.eventsTitle}>Holidays in {currentYear}</Text>

          {holidays.length > 0 ? (
            holidays.map((item) => {
              const dateObj = new Date(item.holidayDate);
              const monthShort = isNaN(dateObj.getTime())
                ? 'Day'
                : dateObj.toLocaleDateString('en-US', { month: 'short' });
              const dayStr = isNaN(dateObj.getTime())
                ? '?'
                : dateObj.toLocaleDateString('en-US', { day: '2-digit' });

              return (
                <TouchableOpacity
                  key={`holiday-${item.id}`}
                  style={[styles.eventCard, Theme.elevation.level1]}
                  activeOpacity={0.8}
                >
                  <View style={[styles.eventBadge, { backgroundColor: Theme.colors.tertiaryContainer }]}>
                    <Text style={[styles.eventMonth, { color: Theme.colors.onTertiaryContainer }]}>
                      {monthShort}
                    </Text>
                    <Text style={[styles.eventDayNum, { color: Theme.colors.onTertiaryContainer }]}>
                      {dayStr}
                    </Text>
                  </View>
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventTitle}>{item.name}</Text>
                    <Text style={styles.eventSub}>
                      {item.description || 'Official Holiday • Office Closed'}
                    </Text>
                  </View>
              
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={{ ...Theme.typography.bodyMd, color: Theme.colors.outline, paddingHorizontal: 4, fontStyle: 'italic' }}>
              No upcoming official holidays registered.
            </Text>
          )}
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
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  weekdayText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: Theme.typography.labelLg.fontSize,
    fontFamily: Theme.typography.labelLg.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    rowGap: 8,
  },
  emptyDay: {
    width: '14.28%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCell: {
    width: '14.28%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
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
    width: 38,
    height: 38,
  },
  holidayDayText: {
    color: Theme.colors.onTertiaryContainer,
    fontWeight: '700',
  },
  dayHighlight: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 38,
  },
  leaveDayStart: {
    backgroundColor: Theme.colors.primaryContainer,
    borderTopLeftRadius: 19,
    borderBottomLeftRadius: 19,
    borderRadius: 0,
    height: 38,
  },
  leaveDayMiddle: {
    backgroundColor: Theme.colors.primaryContainer,
    borderRadius: 0,
    height: 38,
  },
  leaveDayEnd: {
    backgroundColor: Theme.colors.primaryContainer,
    borderTopRightRadius: 19,
    borderBottomRightRadius: 19,
    borderRadius: 0,
    height: 38,
  },
  leaveDayText: {
    color: Theme.colors.onPrimaryContainer,
    fontWeight: '700',
  },
  selectedDay: {
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    borderRadius: 19,
    width: 38,
    height: 38,
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
