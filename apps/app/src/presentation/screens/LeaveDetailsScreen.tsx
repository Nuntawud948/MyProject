import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { getLeaveRequests, LeaveRequestResponse } from '../../data/apis/leave.api';

export function LeaveDetailsScreen() {
  const navigation = useNavigation<any>();
  const { session } = useAuth();
  const employeeId = Number(session?.employeeId || 0);
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<'request' | 'approve'>('request');
  const [requestsList, setRequestsList] = useState<LeaveRequestResponse[]>([]);
  const [approvalsList, setApprovalsList] = useState<LeaveRequestResponse[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // ── Fetch List ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (employeeId) {
      loadRequestsList();
    }
  }, [employeeId]);

  // Reload lists when the screen comes back into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (employeeId) {
        loadRequestsList();
      }
    });
    return unsubscribe;
  }, [navigation, employeeId]);

  const loadRequestsList = async () => {
    setIsLoadingList(true);
    try {
      const list = await getLeaveRequests(employeeId);
      // Sort list by ID descending (most recent first)
      const sorted = [...list].sort((a, b) => b.id - a.id);
      setRequestsList(sorted);

      // Fetch pending approvals where logged-in user is the current active approver
      const approvals = await getLeaveRequests(undefined, employeeId);
      const sortedApprovals = [...approvals].sort((a, b) => b.id - a.id);
      setApprovalsList(sortedApprovals);
    } catch (err) {
      console.log('Failed to fetch leave requests:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('approved')) return Theme.colors.success;
    if (s.includes('reject') || s.includes('deny')) return Theme.colors.error;
    if (s.includes('review') || s.includes('progress') || s.includes('pending')) return Theme.colors.tertiary;
    return Theme.colors.outline;
  };

  const currentData = activeTab === 'request' ? requestsList : approvalsList;

  return (
    <View style={styles.root}>
      {/* Top App Bar */}
      <View style={[styles.topAppBar, { paddingTop: insets.top, height: Theme.spacing.touchTarget + insets.top }]}>
        <View style={styles.userInfo}>
          <Text style={styles.appBarTitle}>Leave Management</Text>
        </View>
        <TouchableOpacity onPress={loadRequestsList} style={styles.bellButton} activeOpacity={0.7}>
          <View style={styles.bellIconContainer}>
            <MaterialIcons
              name={approvalsList.length > 0 ? 'notifications-active' : 'refresh'}
              size={24}
              color={approvalsList.length > 0 ? Theme.colors.error : Theme.colors.primary}
            />
            {approvalsList.length > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{approvalsList.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Alarm Bell Message Banner */}
      {approvalsList.length > 0 && activeTab === 'request' && (
        <TouchableOpacity
          style={styles.alarmBanner}
          onPress={() => setActiveTab('approve')}
          activeOpacity={0.9}
        >
          <MaterialIcons name="warning" size={20} color={Theme.colors.onError} />
          <Text style={styles.alarmBannerText}>
            You have {approvalsList.length} leave request{approvalsList.length > 1 ? 's' : ''} awaiting your approval.
          </Text>
          <MaterialIcons name="chevron-right" size={20} color={Theme.colors.onError} />
        </TouchableOpacity>
      )}

      {/* Tab Bar Selector */}
      <View style={styles.tabBarContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'request' && styles.tabButtonActive]}
          onPress={() => setActiveTab('request')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabButtonText, activeTab === 'request' && styles.tabButtonTextActive]}>
            My Requests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'approve' && styles.tabButtonActive]}
          onPress={() => setActiveTab('approve')}
          activeOpacity={0.8}
        >
          <View style={styles.tabButtonContent}>
            <Text style={[styles.tabButtonText, activeTab === 'approve' && styles.tabButtonTextActive]}>
              Approvals
            </Text>
            {approvalsList.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{approvalsList.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Requests List */}
      {isLoadingList ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={currentData}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {activeTab === 'request'
                ? 'No leave requests recorded yet.'
                : 'No pending approvals for you.'}
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.listItemCard, Theme.elevation.level1]}
              onPress={() => navigation.navigate('LeaveRequestDetails', { id: item.id })}
              activeOpacity={0.8}
            >
              <View style={styles.listItemHeader}>
                <View style={styles.listItemIconBox}>
                  <MaterialIcons name="event" size={20} color={Theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listItemTypeName}>{item.leaveTypeName}</Text>
                  <Text style={styles.listItemDateRange}>
                    {formatDisplayDate(item.startDate)} - {formatDisplayDate(item.endDate)}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                  <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
              {activeTab === 'approve' && (
                <Text style={styles.employeeNameText}>
                  Requester: <Text style={styles.boldText}>{item.employeeName}</Text>
                </Text>
              )}
              <Text style={styles.listItemReason} numberOfLines={1}>
                {item.reason || 'No Reason Provided'}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* BottomNavBar */}
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  appBarTitle: {
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  bellButton: {
    padding: 8,
  },
  bellIconContainer: {
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Theme.colors.error,
    borderRadius: 9,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Theme.colors.surfaceContainerLow,
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  alarmBanner: {
    backgroundColor: Theme.colors.errorContainer,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.marginMobile,
    paddingVertical: 12,
    gap: 8,
  },
  alarmBannerText: {
    flex: 1,
    color: Theme.colors.onErrorContainer,
    fontSize: Theme.typography.bodyMd.fontSize,
    fontFamily: Theme.typography.bodyMd.fontFamily,
    fontWeight: '600',
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surfaceContainerLow,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.outlineVariant,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: Theme.colors.primary,
  },
  tabButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabButtonText: {
    fontSize: Theme.typography.bodyLg.fontSize,
    fontFamily: Theme.typography.bodyLg.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  tabBadge: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.rounded.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.marginMobile,
    paddingTop: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 48,
    color: Theme.colors.outline,
    fontStyle: 'italic',
  },
  listItemCard: {
    backgroundColor: Theme.colors.surfaceContainerLowest,
    borderRadius: Theme.rounded.xl,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 214, 0.2)',
  },
  listItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  listItemIconBox: {
    width: 36,
    height: 36,
    borderRadius: Theme.rounded.lg,
    backgroundColor: Theme.colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemTypeName: {
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
    fontWeight: '700',
    color: Theme.colors.onSurface,
  },
  listItemDateRange: {
    fontSize: Theme.typography.bodyMd.fontSize,
    fontFamily: Theme.typography.bodyMd.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    marginTop: 1,
  },
  listItemReason: {
    fontSize: Theme.typography.bodyMd.fontSize,
    fontFamily: Theme.typography.bodyMd.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    lineHeight: 18,
    paddingLeft: 4,
  },
  employeeNameText: {
    fontSize: Theme.typography.bodyMd.fontSize,
    color: Theme.colors.onSurfaceVariant,
    marginBottom: 6,
    paddingLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.rounded.sm,
  },
  statusBadgeText: {
    fontSize: Theme.typography.labelMd.fontSize,
    fontFamily: Theme.typography.labelMd.fontFamily,
    fontWeight: '700',
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
  boldText: {
    fontWeight: '700',
    color: Theme.colors.onSurface,
  },
});
