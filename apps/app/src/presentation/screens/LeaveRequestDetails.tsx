import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import {
  getLeaveRequestById,
  approveFirstLevel,
  approveSecondLevel,
  LeaveRequestResponse,
} from '../../data/apis/leave.api';

export function LeaveRequestDetails() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const employeeId = Number(session?.employeeId || 0);
  const { id } = route.params || {};

  const [request, setRequest] = useState<LeaveRequestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadDetail(id);
    }
  }, [id]);

  const loadDetail = async (requestId: number) => {
    setIsLoading(true);
    try {
      const detail = await getLeaveRequestById(requestId);
      setRequest(detail);
    } catch (err) {
      console.log('Failed to fetch request details:', err);
    } finally {
      setIsLoading(false);
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

  const getApprovalStepDetails = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'approved') return { icon: 'check', color: Theme.colors.success, text: 'Approved' };
    if (s === 'rejected') return { icon: 'close', color: Theme.colors.error, text: 'Rejected' };
    return { icon: 'hourglass-empty', color: Theme.colors.tertiary, text: 'Pending' };
  };

  const handleApproval = (decision: 'Approved' | 'Rejected') => {
    Alert.alert(
      `${decision} Request`,
      `Are you sure you want to mark this request as ${decision.toLowerCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            if (!id) return;
            setIsSubmitting(true);
            try {
              if (isFirstApprover) {
                await approveFirstLevel(id, decision, remarks);
              } else if (isSecondApprover) {
                await approveSecondLevel(id, decision, remarks);
              }
              Alert.alert('Success', `Request has been ${decision.toLowerCase()}.`);
              navigation.goBack();
            } catch (err) {
              console.log('Failed to submit approval:', err);
              Alert.alert('Error', 'Failed to update request. Please try again.');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Request details could not be loaded.</Text>
        <TouchableOpacity style={styles.backBtnText} onPress={() => navigation.goBack()}>
          <Text style={{ color: Theme.colors.primary, fontWeight: '600', marginTop: 12 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const step1 = getApprovalStepDetails(request.firstApprovalStatus);
  const step2 = getApprovalStepDetails(request.secondApprovalStatus);

  const isFirstApprover = employeeId === request.firstApproverId && request.firstApprovalStatus === 'Pending';
  const isSecondApprover = employeeId === request.secondApproverId && request.firstApprovalStatus === 'Approved' && request.secondApprovalStatus === 'Pending';
  const isActiveApprover = isFirstApprover || isSecondApprover;

  return (
    <View style={styles.root}>
      {/* AppBar */}
      <View style={[styles.topAppBar, { paddingTop: insets.top, height: Theme.spacing.touchTarget + insets.top }]}>
        <View style={styles.userInfo}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={Theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Request Details</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: 48 + insets.bottom }]}>
        {/* Hero Details Card */}
        <View style={[styles.heroCard, Theme.elevation.level1]}>
          <View style={styles.heroHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.leaveTypeBadge}>
                <Text style={styles.leaveTypeBadgeText}>{request.leaveTypeName}</Text>
              </View>
              <Text style={styles.leaveTitle}>{request.reason || 'No Reason Provided'}</Text>
            </View>
            <View style={styles.iconBox}>
              <MaterialIcons name="beach-access" size={24} color={Theme.colors.tertiary} />
            </View>
          </View>

          <View style={styles.heroBody}>
            <View style={styles.detailRow}>
              <MaterialIcons name="calendar-month" size={20} color={Theme.colors.outline} />
              <View>
                <Text style={styles.detailLabel}>Start Date</Text>
                <Text style={styles.detailValue}>{formatDisplayDate(request.startDate)}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="calendar-month" size={20} color={Theme.colors.outline} />
              <View>
                <Text style={styles.detailLabel}>End Date</Text>
                <Text style={styles.detailValue}>{formatDisplayDate(request.endDate)}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="info" size={20} color={Theme.colors.outline} />
              <View>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={[styles.detailValue, { color: getStatusColor(request.status), fontWeight: '700' }]}>
                  {request.status}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Timeline Workflow */}
        <View style={styles.workflowSection}>
          <Text style={styles.sectionTitle}>Approval Workflow</Text>
          <View style={styles.timeline}>
            {/* Step 1: Submission */}
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
                  <Text style={styles.timelineDate}>{formatDisplayDate(request.createdAt)}</Text>
                </View>
                <Text style={styles.timelineText}>The request was successfully submitted by the employee.</Text>
              </View>
            </View>

            {/* Step 2: Line Manager Approval */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineConnectorCol}>
                <View style={step1.text === 'Pending' ? styles.circlePending : styles.circleActive}>
                  {step1.text === 'Pending' ? (
                    <View style={styles.circlePendingDot} />
                  ) : (
                    <MaterialIcons name={step1.icon as any} size={14} color={Theme.colors.onPrimary} />
                  )}
                </View>
                <View style={styles.connectorLine} />
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineStepTitle}>Line Manager Verification</Text>
                  <View style={[styles.statusProgressBadge, { backgroundColor: step1.color + '15' }]}>
                    <Text style={[styles.statusProgressBadgeText, { color: step1.color }]}>{step1.text}</Text>
                  </View>
                </View>
                <Text style={styles.timelineText}>
                  Approver: <Text style={styles.boldText}>{request.firstApproverName || 'Assigned Manager'}</Text>
                </Text>
                {request.firstApprovalReason && (
                  <View style={styles.commentBox}>
                    <Text style={styles.commentText}>"{request.firstApprovalReason}"</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Step 3: HR Approval */}
            <View style={[styles.timelineItem, { paddingBottom: 0 }]}>
              <View style={styles.timelineConnectorCol}>
                <View style={step2.text === 'Pending' ? styles.circlePending : styles.circleActive}>
                  {step2.text === 'Pending' ? (
                    <View style={styles.circlePendingDot} />
                  ) : (
                    <MaterialIcons name={step2.icon as any} size={14} color={Theme.colors.onPrimary} />
                  )}
                </View>
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineStepTitle}>HR Final Verification</Text>
                  <View style={[styles.statusProgressBadge, { backgroundColor: step2.color + '15' }]}>
                    <Text style={[styles.statusProgressBadgeText, { color: step2.color }]}>{step2.text}</Text>
                  </View>
                </View>
                <Text style={styles.timelineText}>
                  Approver: <Text style={styles.boldText}>{request.secondApproverName || 'HR Coordinator'}</Text>
                </Text>
                {request.secondApprovalReason && (
                  <View style={styles.commentBox}>
                    <Text style={styles.commentText}>"{request.secondApprovalReason}"</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Manager Action Section */}
        {isActiveApprover && (
          <View style={[styles.actionCard, Theme.elevation.level2]}>
            <Text style={styles.actionTitle}>Review Action Required</Text>
            <Text style={styles.actionSubtitle}>
              You are assigned to verify this leave request. Please write any feedback or remarks and choose to approve or reject.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Remarks / Approval Reason</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Write approval or rejection feedback here..."
                placeholderTextColor={Theme.colors.outline}
                value={remarks}
                onChangeText={setRemarks}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleApproval('Rejected')}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                <MaterialIcons name="close" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Reject</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleApproval('Approved')}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                <MaterialIcons name="check" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
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
    backgroundColor: Theme.colors.background,
  },
  emptyText: {
    color: Theme.colors.outline,
    fontStyle: 'italic',
  },
  backBtnText: {
    padding: 8,
  },
  topAppBar: {
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.marginMobile,
    paddingTop: 24,
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
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
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
  boldText: {
    fontWeight: '700',
    color: Theme.colors.onSurface,
  },
  commentBox: {
    marginTop: 8,
    backgroundColor: Theme.colors.surfaceContainerLow,
    borderRadius: Theme.rounded.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: Theme.colors.outlineVariant,
  },
  commentText: {
    fontSize: Theme.typography.bodyMd.fontSize,
    fontFamily: Theme.typography.bodyMd.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  actionCard: {
    backgroundColor: Theme.colors.surfaceContainerLowest,
    borderRadius: Theme.rounded.xl,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Theme.colors.outlineVariant,
  },
  actionTitle: {
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
    fontWeight: '700',
    color: Theme.colors.primary,
    marginBottom: 6,
  },
  actionSubtitle: {
    fontSize: Theme.typography.bodyMd.fontSize,
    fontFamily: Theme.typography.bodyMd.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: Theme.typography.labelMd.fontSize,
    fontFamily: Theme.typography.labelMd.fontFamily,
    color: Theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Theme.colors.surfaceContainerLow,
    borderRadius: Theme.rounded.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: Theme.colors.outlineVariant,
    color: Theme.colors.onSurface,
    fontSize: Theme.typography.bodyMd.fontSize,
    fontFamily: Theme.typography.bodyMd.fontFamily,
    textAlignVertical: 'top',
    height: 80,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderRadius: Theme.rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  rejectButton: {
    backgroundColor: Theme.colors.error,
  },
  approveButton: {
    backgroundColor: Theme.colors.success,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: Theme.typography.labelLg.fontSize,
    fontFamily: Theme.typography.labelLg.fontFamily,
    fontWeight: '700',
  },
});
