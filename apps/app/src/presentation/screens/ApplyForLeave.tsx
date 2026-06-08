/**
 * @file ApplyForLeave.tsx
 * @description Leave application form screen post-login — allows selecting leave types,
 * viewing current balances from the API, simulating request duration, and submitting.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Theme } from '../theme';
import { DateRangePicker } from '../components/DateRangePicker';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

interface LeaveBalance {
  id: number;
  employeeId: number;
  leaveTypeId: number;
  leaveTypeName: string;
  allocatedHours: number;
  usedHours: number;
  remainingHours: number;
}

interface LeaveSimulation {
  workingDays: number;
  totalHours: number;
  excludedDays: number;
}

export function ApplyForLeave() {
  const navigation = useNavigation<any>();
  const { session } = useAuth();
  const employeeId = session?.employeeId;
  const insets = useSafeAreaInsets();

  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState(''); // Format: YYYY-MM-DD
  const [endDate, setEndDate] = useState(''); // Format: YYYY-MM-DD
  const [reason, setReason] = useState('');
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simulation, setSimulation] = useState<LeaveSimulation | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [durationMode, setDurationMode] = useState<'fullDay' | 'morning' | 'afternoon'>('fullDay');

  // ── Fetch Balances ───────────────────────────────────────────────────────
  useEffect(() => {
    if (employeeId) {
      fetchBalances();
    }
  }, [employeeId]);

  const fetchBalances = async () => {
    setIsLoadingBalances(true);
    try {
      const response = await axios.get<LeaveBalance[]>(
        `${BASE_URL}/api/Leaves/balances/${employeeId}`
      );
      // Backend may return response wrapped or direct array
      const data = (response.data as any).data || response.data;
      setBalances(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0) {
        setSelectedTypeId(data[0].leaveTypeId);
      }
    } catch (err) {
      console.log('Failed to fetch leave balances:', err);
    } finally {
      setIsLoadingBalances(false);
    }
  };

  // ── Trigger Simulation on Date Change ─────────────────────────────────────
  useEffect(() => {
    // Basic validation to run simulation (YYYY-MM-DD checks)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const isValid = durationMode === 'fullDay' ? (dateRegex.test(startDate) && dateRegex.test(endDate)) : dateRegex.test(startDate);
    if (isValid) {
      const triggerSimulation = async () => {
        setIsSimulating(true);
        try {
          let startIso = '';
          let endIso = '';
          if (durationMode === 'fullDay') {
            startIso = `${startDate}T08:00:00`;
            endIso = `${endDate}T17:00:00`;
          } else if (durationMode === 'morning') {
            startIso = `${startDate}T08:00:00`;
            endIso = `${startDate}T12:00:00`;
          } else { // afternoon
            startIso = `${startDate}T13:00:00`;
            endIso = `${startDate}T17:00:00`;
          }

          const res = await axios.post(
            `${BASE_URL}/api/Leaves/simulate`,
            {
              startDate: startIso,
              endDate: endIso,
            }
          );
          const simData = res.data?.data || res.data;
          setSimulation(simData);
        } catch (err) {
          console.log('Simulation failed', err);
          setSimulation(null);
        } finally {
          setIsSimulating(false);
        }
      };

      const delay = setTimeout(triggerSimulation, 500);
      return () => clearTimeout(delay);
    } else {
      setSimulation(null);
    }
  }, [startDate, endDate, durationMode]);

  // ── Submit Request ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedTypeId) {
      Alert.alert('Required', 'Please select a leave type.');
      return;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const isValid = durationMode === 'fullDay' ? (dateRegex.test(startDate) && dateRegex.test(endDate)) : dateRegex.test(startDate);
    if (!isValid) {
      Alert.alert('Invalid Dates', 'Please specify dates using the Date Picker.');
      return;
    }
    if (!reason.trim()) {
      Alert.alert('Reason Required', 'Please explain the reason for your request.');
      return;
    }

    setIsSubmitting(true);
    try {
      let startIso = '';
      let endIso = '';
      if (durationMode === 'fullDay') {
        startIso = `${startDate}T08:00:00`;
        endIso = `${endDate}T17:00:00`;
      } else if (durationMode === 'morning') {
        startIso = `${startDate}T08:00:00`;
        endIso = `${startDate}T12:00:00`;
      } else { // afternoon
        startIso = `${startDate}T13:00:00`;
        endIso = `${startDate}T17:00:00`;
      }

      const payload = {
        employeeId: Number(employeeId),
        leaveTypeId: Number(selectedTypeId),
        startDate: new Date(startIso).toISOString(),
        endDate: new Date(endIso).toISOString(),
        reason: reason.trim(),
        submittedByEmployeeId: Number(employeeId),
      };

      await axios.post(`${BASE_URL}/api/Leaves/requests`, payload);
      Alert.alert('Success', 'Leave request submitted successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.log('Failed to submit leave request:', err);
      Alert.alert('Submission Error', 'Failed to submit leave request. Check your balances.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLeaveIcon = (typeName: string) => {
    const name = typeName.toLowerCase();
    if (name.includes('sick')) return 'medical-services';
    if (name.includes('casual')) return 'weekend';
    return 'event-available';
  };

  const getLeaveIconColor = (typeName: string) => {
    const name = typeName.toLowerCase();
    if (name.includes('sick')) return Theme.colors.error;
    if (name.includes('casual')) return Theme.colors.tertiary;
    return Theme.colors.primary;
  };

  const handleSelectRange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* ── TopAppBar ──────────────────────────────────────────────────── */}
      <View style={[styles.topAppBar, { paddingTop: insets.top, height: Theme.spacing.touchTarget + insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>WorkForce</Text>
        <View style={styles.appBarSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 48 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Page Title ────────────────────────────────────────────────── */}
        <View style={styles.pageTitleContainer}>
          <Text style={styles.pageTitle}>Apply for Leave</Text>
          <Text style={styles.pageSubtitle}>Submit your request for time off</Text>
        </View>

        {/* ── Leave Balances ────────────────────────────────────────────── */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>โควตาวันลาคงเหลือ (Leave Balances)</Text>
          {isLoadingBalances ? (
            <ActivityIndicator color={Theme.colors.primary} size="small" style={{ marginVertical: 12 }} />
          ) : balances.length === 0 ? (
            <Text style={styles.emptyBalances}>No leave balances found.</Text>
          ) : (
            <View style={styles.balancesGrid}>
              {balances.map((bal) => {
                const isSelected = selectedTypeId === bal.leaveTypeId;
                return (
                  <TouchableOpacity
                    key={bal.id || bal.leaveTypeId}
                    style={[
                      styles.balanceCard,
                      isSelected && styles.balanceCardSelected,
                    ]}
                    onPress={() => setSelectedTypeId(bal.leaveTypeId)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.balanceHeader}>
                      <MaterialIcons
                        name={getLeaveIcon(bal.leaveTypeName)}
                        size={20}
                        color={getLeaveIconColor(bal.leaveTypeName)}
                      />
                      <Text style={styles.balanceTypeName} numberOfLines={1}>
                        {bal.leaveTypeName}
                      </Text>
                    </View>
                    <View style={styles.balanceFooter}>
                      <Text style={styles.balanceRemainingLabel}>Remaining</Text>
                      <Text style={styles.balanceRemainingValue}>
                        {(bal.remainingHours / 8).toFixed(1)} Days
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* ── Leave Type Selection ──────────────────────────────────────── */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Select Leave Type</Text>
          <View style={styles.radioList}>
            {balances.map((bal) => {
              const isChecked = selectedTypeId === bal.leaveTypeId;
              return (
                <TouchableOpacity
                  key={`select-${bal.leaveTypeId}`}
                  style={[
                    styles.radioItem,
                    isChecked && styles.radioItemChecked,
                  ]}
                  onPress={() => setSelectedTypeId(bal.leaveTypeId)}
                  activeOpacity={0.8}
                >
                  <View style={styles.radioLeft}>
                    <MaterialIcons
                      name={getLeaveIcon(bal.leaveTypeName)}
                      size={24}
                      color={getLeaveIconColor(bal.leaveTypeName)}
                    />
                    <View>
                      <Text style={styles.radioTitle}>{bal.leaveTypeName}</Text>
                      <Text style={styles.radioSub}>
                        {bal.remainingHours} hours remaining
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.radioOutline, isChecked && styles.radioChecked]}>
                    {isChecked && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Date Pickers ──────────────────────────────────────────────── */}
        <View style={styles.datePickerRow}>
          <TouchableOpacity
            style={styles.dateField}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.dateLabel}>Start Date</Text>
            <View style={styles.inputWithIcon}>
              <View style={styles.dateInputWrapper}>
                <Text style={[styles.dateText, !startDate && styles.placeholderText]}>
                  {startDate || 'YYYY-MM-DD'}
                </Text>
              </View>
              <MaterialIcons
                name="calendar-today"
                size={18}
                color={Theme.colors.onSurfaceVariant}
                style={styles.fieldIcon}
              />
            </View>
          </TouchableOpacity>

          {durationMode === 'fullDay' && (
            <TouchableOpacity
              style={styles.dateField}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.dateLabel}>End Date</Text>
              <View style={styles.inputWithIcon}>
                <View style={styles.dateInputWrapper}>
                  <Text style={[styles.dateText, !endDate && styles.placeholderText]}>
                    {endDate || 'YYYY-MM-DD'}
                  </Text>
                </View>
                <MaterialIcons
                  name="calendar-today"
                  size={18}
                  color={Theme.colors.onSurfaceVariant}
                  style={styles.fieldIcon}
                />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Duration Segment (เวลาพักร้อน) ────────────────────────────── */}
        <View style={styles.sectionContainer}>
          <Text style={styles.dateLabel}>Duration Segment (เวลาพักร้อน)</Text>
          <View style={styles.durationSegmentRow}>
            {[
              { value: 'fullDay', label: 'เต็มวัน\n(8 hr)' },
              { value: 'morning', label: 'ช่วงเช้า\n(4 hr)' },
              { value: 'afternoon', label: 'ช่วงบ่าย\n(4 hr)' },
            ].map((opt) => {
              const isSelected = durationMode === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.durationSegmentBtn,
                    isSelected && styles.durationSegmentBtnActive,
                  ]}
                  onPress={() => setDurationMode(opt.value as any)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.durationSegmentText,
                      isSelected && styles.durationSegmentTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Reason for Leave ──────────────────────────────────────────── */}
        <View style={styles.sectionContainer}>
          <Text style={styles.dateLabel}>Reason for Leave</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Briefly explain the reason for your request..."
            placeholderTextColor={Theme.colors.onSurfaceVariant}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
        </View>

        {/* ── Summary Bento Card ────────────────────────────────────────── */}
        {simulation ? (
          <View style={styles.summaryBentoCard}>
            <View style={styles.summaryLeft}>
              <View style={styles.summaryIconCircle}>
                <MaterialIcons name="info" size={20} color={Theme.colors.onPrimary} />
              </View>
              <View>
                <Text style={styles.summaryTitle}>Simulation Breakdown</Text>
                <Text style={styles.summarySub}>
                  Total: {simulation.totalHours} hrs ({simulation.workingDays} days)
                </Text>
              </View>
            </View>
            <MaterialIcons name="trending-flat" size={20} color={Theme.colors.primary} />
          </View>
        ) : isSimulating ? (
          <ActivityIndicator color={Theme.colors.primary} size="small" style={{ marginVertical: 8 }} />
        ) : null}

        {/* ── Submit Button ────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Theme.colors.onPrimary} size="small" />
          ) : (
            <>
              <MaterialIcons name="send" size={20} color={Theme.colors.onPrimary} />
              <Text style={styles.submitButtonText}>Submit Request</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Date Range Picker Modal */}
      <DateRangePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectRange={handleSelectRange}
        initialStartDate={startDate}
        initialEndDate={endDate}
      />
    </KeyboardAvoidingView>
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
  backButton: {
    padding: 8,
  },
  appBarTitle: {
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  appBarSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.marginMobile,
    paddingTop: 24,
    paddingBottom: 48,
  },
  pageTitleContainer: {
    marginBottom: 28,
  },
  pageTitle: {
    fontSize: Theme.typography.headlineLgMobile.fontSize,
    fontFamily: Theme.typography.headlineLgMobile.fontFamily,
    fontWeight: '700',
    color: Theme.colors.onSurface,
  },
  pageSubtitle: {
    fontSize: Theme.typography.bodyMd.fontSize,
    fontFamily: Theme.typography.bodyMd.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    marginTop: 4,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
    fontWeight: '600',
    color: Theme.colors.onSurface,
    marginBottom: 12,
  },
  emptyBalances: {
    fontSize: Theme.typography.bodyMd.fontSize,
    fontFamily: Theme.typography.bodyMd.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  balancesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  balanceCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Theme.colors.surfaceContainerLowest,
    borderRadius: Theme.rounded.lg,
    padding: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  balanceCardSelected: {
    borderColor: Theme.colors.primary,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  balanceTypeName: {
    fontSize: Theme.typography.labelLg.fontSize,
    fontFamily: Theme.typography.labelLg.fontFamily,
    fontWeight: '600',
    color: Theme.colors.onSurface,
    flex: 1,
  },
  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceRemainingLabel: {
    fontSize: Theme.typography.labelMd.fontSize,
    fontFamily: Theme.typography.labelMd.fontFamily,
    color: Theme.colors.onSurfaceVariant,
  },
  balanceRemainingValue: {
    fontSize: Theme.typography.bodyMd.fontSize,
    fontFamily: Theme.typography.bodyMd.fontFamily,
    fontWeight: '700',
    color: Theme.colors.success,
  },
  radioList: {
    gap: 10,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Theme.colors.outlineVariant,
    borderRadius: Theme.rounded.xl,
  },
  radioItemChecked: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.surfaceContainerLow,
  },
  radioLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  radioTitle: {
    fontSize: Theme.typography.bodyLg.fontSize,
    fontFamily: Theme.typography.bodyLg.fontFamily,
    fontWeight: '600',
    color: Theme.colors.onSurface,
  },
  radioSub: {
    fontSize: Theme.typography.labelMd.fontSize,
    fontFamily: Theme.typography.labelMd.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  radioOutline: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Theme.colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioChecked: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.primary,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  datePickerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  durationSegmentRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  durationSegmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Theme.rounded.xl,
    backgroundColor: Theme.colors.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationSegmentBtnActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  durationSegmentText: {
    fontSize: Theme.typography.labelLg.fontSize,
    fontFamily: Theme.typography.labelLg.fontFamily,
    fontWeight: '600',
    color: Theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  durationSegmentTextActive: {
    color: Theme.colors.onPrimary,
    fontWeight: '700',
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    fontSize: Theme.typography.labelLg.fontSize,
    fontFamily: Theme.typography.labelLg.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  inputWithIcon: {
    position: 'relative',
    justifyContent: 'center',
  },
  dateInputWrapper: {
    backgroundColor: Theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Theme.colors.outline,
    borderRadius: Theme.rounded.xl,
    height: Theme.spacing.touchTarget,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  dateText: {
    color: Theme.colors.onSurface,
    fontSize: Theme.typography.bodyMd.fontSize,
    fontFamily: Theme.typography.bodyMd.fontFamily,
  },
  placeholderText: {
    color: Theme.colors.onSurfaceVariant,
  },
  fieldIcon: {
    position: 'absolute',
    right: 12,
  },
  textArea: {
    backgroundColor: Theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Theme.colors.outline,
    borderRadius: Theme.rounded.xl,
    padding: 14,
    color: Theme.colors.onSurface,
    fontSize: Theme.typography.bodyMd.fontSize,
    fontFamily: Theme.typography.bodyMd.fontFamily,
    height: 100,
    textAlignVertical: 'top',
  },
  summaryBentoCard: {
    backgroundColor: Theme.colors.primaryFixed,
    borderRadius: Theme.rounded.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: Theme.typography.labelMd.fontSize,
    fontFamily: Theme.typography.labelMd.fontFamily,
    color: Theme.colors.onPrimaryFixed,
    fontWeight: '700',
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  summarySub: {
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
    color: Theme.colors.onPrimaryFixed,
    fontWeight: '600',
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: Theme.colors.primary,
    height: Theme.spacing.touchTarget,
    borderRadius: Theme.rounded.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: Theme.colors.onPrimary,
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
    fontWeight: '600',
  },
});
