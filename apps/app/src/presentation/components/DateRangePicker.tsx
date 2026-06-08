/**
 * @file DateRangePicker.tsx
 * @description A custom visual calendar date range selector component for React Native.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Theme } from '../theme';

interface DateRangePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectRange: (startDate: string, endDate: string) => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  visible,
  onClose,
  onSelectRange,
  initialStartDate = '',
  initialEndDate = '',
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState<string>(initialStartDate);
  const [selectedEnd, setSelectedEnd] = useState<string>(initialEndDate);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get number of days in month & starting day index of week
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  // Generate calendar days
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const formatDateString = (day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const handleDayPress = (day: number) => {
    const dateStr = formatDateString(day);

    if (!selectedStart || (selectedStart && selectedEnd)) {
      // Set new start date
      setSelectedStart(dateStr);
      setSelectedEnd('');
    } else {
      // Set end date if it is after start date, else reset start date
      if (new Date(dateStr) >= new Date(selectedStart)) {
        setSelectedEnd(dateStr);
      } else {
        setSelectedStart(dateStr);
      }
    }
  };

  const isBetween = (day: number) => {
    if (!selectedStart || !selectedEnd) return false;
    const dateStr = formatDateString(day);
    const current = new Date(dateStr);
    return current > new Date(selectedStart) && current < new Date(selectedEnd);
  };

  const handleConfirm = () => {
    if (selectedStart && selectedEnd) {
      onSelectRange(selectedStart, selectedEnd);
      onClose();
    }
  };

  const getMonthName = (mIndex: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return months[mIndex];
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.calendarCard, Theme.elevation.level2]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
              <MaterialIcons name="chevron-left" size={24} color={Theme.colors.onSurface} />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{`${getMonthName(month)} ${year}`}</Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
              <MaterialIcons name="chevron-right" size={24} color={Theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Weekday headers */}
          <View style={styles.weekdayRow}>
            {DAYS_OF_WEEK.map((d) => (
              <Text key={d} style={styles.weekdayText}>{d}</Text>
            ))}
          </View>

          {/* Days Grid */}
          <FlatList
            data={calendarDays}
            keyExtractor={(_, index) => `day-${index}`}
            numColumns={7}
            scrollEnabled={false}
            renderItem={({ item }) => {
              if (item === null) {
                return <View style={styles.emptyDay} />;
              }

              const dateStr = formatDateString(item);
              const isStart = selectedStart === dateStr;
              const isEnd = selectedEnd === dateStr;
              const inRange = isBetween(item);

              return (
                <TouchableOpacity
                  style={[
                    styles.dayCell,
                    inRange && styles.dayInRange,
                    isStart && styles.dayStart,
                    isEnd && styles.dayEnd,
                  ]}
                  onPress={() => handleDayPress(item)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dayText,
                      inRange && styles.dayTextInRange,
                      (isStart || isEnd) && styles.dayTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

          {/* Selection Status */}
          <View style={styles.statusFooter}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Start:</Text>
              <Text style={styles.statusValue}>{selectedStart || '--'}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>End:</Text>
              <Text style={styles.statusValue}>{selectedEnd || '--'}</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              style={[
                styles.confirmBtn,
                (!selectedStart || !selectedEnd) && styles.confirmBtnDisabled,
              ]}
              disabled={!selectedStart || !selectedEnd}
            >
              <Text style={styles.confirmText}>Apply Range</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(25, 28, 29, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Theme.colors.surfaceContainerLowest,
    borderRadius: Theme.rounded.xl,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navBtn: {
    padding: 4,
  },
  monthLabel: {
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
    fontWeight: '700',
    color: Theme.colors.onSurface,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayText: {
    width: 38,
    textAlign: 'center',
    fontSize: Theme.typography.labelMd.fontSize,
    fontFamily: Theme.typography.labelMd.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    fontWeight: '600',
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
  dayStart: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 19,
  },
  dayEnd: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 19,
  },
  dayInRange: {
    backgroundColor: 'rgba(0, 91, 191, 0.1)',
    borderRadius: 0,
  },
  dayTextSelected: {
    color: Theme.colors.onPrimary,
    fontWeight: '700',
  },
  dayTextInRange: {
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  statusFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.outlineVariant,
    marginTop: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusLabel: {
    fontSize: Theme.typography.labelMd.fontSize,
    fontFamily: Theme.typography.labelMd.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: Theme.typography.labelLg.fontSize,
    fontFamily: Theme.typography.labelLg.fontFamily,
    color: Theme.colors.onSurface,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: Theme.spacing.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.surfaceContainerLow,
    borderRadius: Theme.rounded.full,
  },
  cancelText: {
    color: Theme.colors.onSurfaceVariant,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1.5,
    height: Theme.spacing.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.rounded.full,
  },
  confirmBtnDisabled: {
    opacity: 0.4,
  },
  confirmText: {
    color: Theme.colors.onPrimary,
    fontWeight: '600',
  },
});
