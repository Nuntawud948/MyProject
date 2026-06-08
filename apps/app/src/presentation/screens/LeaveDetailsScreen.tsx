/**
 * @file LeaveDetailsScreen.tsx
 * @description Screen displaying detail breakdown of a leave request along with approval workflows and timeline status.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../theme';
import { useAuth } from '../context/AuthContext';

export function LeaveDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();

  const userAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMkTtQ960cOCGlzHxlU1cbnc8LaSU2dtSIzg0tH8Jid5W3ZFFu25NYOKQJAZzD0juYjZbkwSiTpli33CewD4Lsole7MW_eCBNFHcXjGtKQ5Xr4V9YIVyb5OkBaqX88W2-ch0-ZEtTtHehhhMbwL-Ak5KGagrR6LtuQGKwRhr1x5ly2GJhah3uIZrsuR6hQL3YshSsHVPrq07ccn2iwCEUxQG8yRmeUDinvz6VI7oiTcNdBt9mUFI_k0Dwcx5qyDsDl8r1D696BXqI';

  return (
    <View style={styles.root}>
      {/* ── TopAppBar ──────────────────────────────────────────────────── */}
      <View style={[styles.topAppBar, { paddingTop: insets.top, height: Theme.spacing.touchTarget + insets.top }]}>
        <View style={styles.userInfo}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={Theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Leave History Details</Text>
        </View>
        <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
          <MaterialIcons name="notifications" size={24} color={Theme.colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}>
        {/* ── Hero Details Card ───────────────────────────────────────────── */}
        <View style={[styles.heroCard, Theme.elevation.level1]}>
          <View style={styles.heroHeader}>
            <View>
              <View style={styles.leaveTypeBadge}>
                <Text style={styles.leaveTypeBadgeText}>Annual Leave</Text>
              </View>
              <Text style={styles.leaveTitle}>Family vacation</Text>
            </View>
            <View style={styles.iconBox}>
              <MaterialIcons name="beach-access" size={24} color={Theme.colors.tertiary} />
            </View>
          </View>

          <View style={styles.heroBody}>
            <View style={styles.detailRow}>
              <MaterialIcons name="calendar-month" size={20} color={Theme.colors.outline} />
              <View>
                <Text style={styles.detailLabel}>Date Range</Text>
                <Text style={styles.detailValue}>Oct 12 - Oct 15, 2023</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="info" size={20} color={Theme.colors.outline} />
              <View>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={[styles.detailValue, { color: Theme.colors.tertiaryContainer, fontWeight: '600' }]}>
                  Under HR Review
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Timeline Workflow Section ───────────────────────────────────── */}
        <View style={styles.workflowSection}>
          <Text style={styles.sectionTitle}>Approval Workflow</Text>
          <View style={styles.timeline}>
            
            {/* Step 1: Completed */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineConnectorCol}>
                <View style={styles.circleActive}>
                  <MaterialIcons name="check" size={14} color={Theme.colors.onPrimary} />
                </View>
                <View style={styles.connectorLine} />
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineStepTitle}>Request Submitted</Text>
                  <Text style={styles.timelineDate}>Oct 01, 2023</Text>
                </View>
                <Text style={styles.timelineText}>The request was successfully submitted by the employee.</Text>
              </View>
            </View>

            {/* Step 2: Completed */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineConnectorCol}>
                <View style={styles.circleActive}>
                  <MaterialIcons name="check" size={14} color={Theme.colors.onPrimary} />
                </View>
                <View style={styles.connectorLine} />
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineStepTitle}>Line Manager Approval</Text>
                  <Text style={styles.timelineDate}>Oct 02, 2023</Text>
                </View>
                <Text style={styles.timelineText}>
                  Approved by <Text style={styles.boldText}>Sarah Jenkins</Text>.
                </Text>
                <View style={styles.commentBox}>
                  <Text style={styles.commentText}>
                    "Approved. Please ensure handovers are completed before the 12th."
                  </Text>
                </View>
              </View>
            </View>

            {/* Step 3: Pending */}
            <View style={[styles.timelineItem, { paddingBottom: 0 }]}>
              <View style={styles.timelineConnectorCol}>
                <View style={styles.circlePending}>
                  <View style={styles.circlePendingDot} />
                </View>
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={[styles.timelineStepTitle, { color: Theme.colors.primary }]}>
                    HR Final Approval
                  </Text>
                  <View style={styles.statusProgressBadge}>
                    <Text style={styles.statusProgressBadgeText}>In Progress</Text>
                  </View>
                </View>
                <Text style={styles.timelineText}>
                  Awaiting final verification from the People & Culture department.
                </Text>
                <View style={styles.waitNoticeCard}>
                  <MaterialIcons name="hourglass-empty" size={20} color={Theme.colors.outline} />
                  <Text style={styles.waitNoticeText}>
                    Standard processing time: 1-2 business days
                  </Text>
                </View>
              </View>
            </View>

          </View>
        </View>

        {/* ── Help Button ────────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.helpBtn} activeOpacity={0.7}>
          <MaterialIcons name="help-outline" size={18} color={Theme.colors.primary} />
          <Text style={styles.helpBtnText}>Need help with this request?</Text>
        </TouchableOpacity>
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

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Schedule')}
          activeOpacity={0.8}
        >
          <MaterialIcons name="calendar-today" size={22} color={Theme.colors.onSurfaceVariant} />
          <Text style={styles.navText}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navItem, styles.navItemActive]} activeOpacity={0.8}>
          <MaterialIcons name="history" size={22} color={Theme.colors.primary} />
          <Text style={[styles.navText, styles.navTextActive]}>Records</Text>
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
    gap: 8,
  },
  backBtn: {
    padding: 8,
  },
  appBarTitle: {
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
    fontWeight: '700',
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
  heroCard: {
    backgroundColor: Theme.colors.surfaceContainerLowest,
    borderRadius: Theme.rounded.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 214, 0.3)',
    marginBottom: 24,
  },
  heroHeader: {
    padding: 20,
    backgroundColor: Theme.colors.surfaceBright,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.outlineVariant,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leaveTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 91, 191, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.rounded.full,
    marginBottom: 8,
  },
  leaveTypeBadgeText: {
    fontSize: Theme.typography.labelMd.fontSize,
    fontFamily: Theme.typography.labelMd.fontFamily,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  leaveTitle: {
    fontSize: Theme.typography.headlineMd.fontSize,
    fontFamily: Theme.typography.headlineMd.fontFamily,
    fontWeight: '700',
    color: Theme.colors.onSurface,
  },
  iconBox: {
    backgroundColor: Theme.colors.tertiaryFixed,
    width: 44,
    height: 44,
    borderRadius: Theme.rounded.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBody: {
    padding: 20,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    fontSize: Theme.typography.labelMd.fontSize,
    fontFamily: Theme.typography.labelMd.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: Theme.typography.bodyLg.fontSize,
    fontFamily: Theme.typography.bodyLg.fontFamily,
    color: Theme.colors.onSurface,
    marginTop: 2,
  },
  workflowSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
    fontWeight: '600',
    color: Theme.colors.onSurface,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  timeline: {
    paddingHorizontal: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 24,
  },
  timelineConnectorCol: {
    alignItems: 'center',
    width: 24,
  },
  circleActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  circlePending: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Theme.colors.primaryContainer,
    backgroundColor: Theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  circlePendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.primaryContainer,
  },
  connectorLine: {
    position: 'absolute',
    left: 11,
    top: 24,
    bottom: -8,
    width: 2,
    backgroundColor: Theme.colors.outlineVariant,
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineStepTitle: {
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
    fontWeight: '600',
    color: Theme.colors.onSurface,
  },
  timelineDate: {
    fontSize: Theme.typography.labelMd.fontSize,
    fontFamily: Theme.typography.labelMd.fontFamily,
    color: Theme.colors.onSurfaceVariant,
  },
  timelineText: {
    fontSize: Theme.typography.bodyMd.fontSize,
    fontFamily: Theme.typography.bodyMd.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    lineHeight: Theme.typography.bodyMd.lineHeight,
  },
  boldText: {
    fontWeight: '600',
    color: Theme.colors.onSurface,
  },
  commentBox: {
    marginTop: 8,
    backgroundColor: Theme.colors.surfaceContainer,
    borderRadius: Theme.rounded.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: Theme.colors.outlineVariant,
  },
  commentText: {
    fontSize: Theme.typography.bodyMd.fontSize,
    fontFamily: Theme.typography.bodyMd.fontFamily,
    color: Theme.colors.onSurface,
    fontStyle: 'italic',
  },
  statusProgressBadge: {
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Theme.rounded.sm,
  },
  statusProgressBadgeText: {
    fontSize: Theme.typography.labelMd.fontSize,
    fontFamily: Theme.typography.labelMd.fontFamily,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  waitNoticeCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: Theme.rounded.xl,
    borderWidth: 1.5,
    borderColor: Theme.colors.outlineVariant,
    borderStyle: 'dashed',
    backgroundColor: Theme.colors.surfaceContainerLow,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  waitNoticeText: {
    fontSize: Theme.typography.labelLg.fontSize,
    fontFamily: Theme.typography.labelLg.fontFamily,
    color: Theme.colors.outline,
    textAlign: 'center',
  },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Theme.rounded.full,
    marginTop: 8,
  },
  helpBtnText: {
    fontSize: Theme.typography.labelLg.fontSize,
    fontFamily: Theme.typography.labelLg.fontFamily,
    color: Theme.colors.primary,
    fontWeight: '600',
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
