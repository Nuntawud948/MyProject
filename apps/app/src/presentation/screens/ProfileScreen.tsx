/**
 * @file ProfileScreen.tsx
 * @description Profile screen displaying employee details, PTO balances, documents, and logout triggers.
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
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../theme';
import { useAuth } from '../context/AuthContext';

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { session, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const userAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdTZn55eZDNVBCMDa1XxRzM1nH3_nu68Fm-0q7m-8KR4W8IQu3MZGfRkB9FeudNZgSslpsIJhryxa4rAKKR23N_rC42v57SRzWJWdoUKFm8rQ5VpE_irC_4orwhsEAPiH71oAAMPJkfcNwqsTCOMFZlWq4GS4BI92zjWMzYpc8EWPvgI4glozYaFSYmWstyQTub_uujZeT9M08FQo4CKLajq9b9owmfhHr79aEHPYEcFvTCtN2mGri0rZFzpK945r8ko8VLPUqFTs';

  return (
    <View style={styles.root}>
      {/* ── TopAppBar ──────────────────────────────────────────────────── */}
      <View style={[styles.topAppBar, { paddingTop: insets.top, height: Theme.spacing.touchTarget + insets.top }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.appBarTitle}>Employee Profile</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}>
        {/* ── Profile Header Section ────────────────────────────────────── */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarBorder, Theme.elevation.level1]}>
              <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
            </View>
            <TouchableOpacity style={styles.editAvatarBtn} activeOpacity={0.8}>
              <MaterialIcons name="edit" size={16} color={Theme.colors.onPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{session?.username ?? 'Alex Johnson'}</Text>
          <Text style={styles.userRole}>{session?.role ?? 'Senior HR Specialist'}</Text>
          <Text style={styles.userOrg}>People & Culture • ID: HR-2024-08</Text>
        </View>

        {/* ── Stats Grid (Bento Style) ──────────────────────────────────── */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, Theme.elevation.level1]}>
            <Text style={styles.statLabel}>Join Date</Text>
            <Text style={styles.statValue}>Oct 12, 2021</Text>
          </View>
          <View style={[styles.statCard, Theme.elevation.level1]}>
            <Text style={styles.statLabel}>PTO Balance</Text>
            <Text style={styles.statValue}>18 Days</Text>
          </View>
        </View>

        {/* ── Categorized List Items ────────────────────────────────────── */}
        <View style={styles.listSection}>
          
          {/* Personal Information */}
          <Text style={styles.categoryTitle}>Personal Information</Text>
          <View style={[styles.categoryCard, Theme.elevation.level1]}>
            <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
              <MaterialIcons name="person" size={22} color={Theme.colors.primary} />
              <View style={styles.listItemDetails}>
                <Text style={styles.listItemTitle}>Full Name</Text>
                <Text style={styles.listItemSub}>{session?.username ?? 'Alex Johnson Rivera'}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={Theme.colors.outline} style={{ opacity: 0.5 }} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
              <MaterialIcons name="mail" size={22} color={Theme.colors.primary} />
              <View style={styles.listItemDetails}>
                <Text style={styles.listItemTitle}>Work Email</Text>
                <Text style={styles.listItemSub}>alex.rivera@workforce.com</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={Theme.colors.outline} style={{ opacity: 0.5 }} />
            </TouchableOpacity>
          </View>

          {/* Work Details */}
          <Text style={styles.categoryTitle}>Work Details</Text>
          <View style={[styles.categoryCard, Theme.elevation.level1]}>
            <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
              <MaterialIcons name="work" size={22} color={Theme.colors.primary} />
              <View style={styles.listItemDetails}>
                <Text style={styles.listItemTitle}>Position</Text>
                <Text style={styles.listItemSub}>{session?.role ?? 'Senior HR Specialist (Full-time)'}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={Theme.colors.outline} style={{ opacity: 0.5 }} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
              <MaterialIcons name="corporate-fare" size={22} color={Theme.colors.primary} />
              <View style={styles.listItemDetails}>
                <Text style={styles.listItemTitle}>Department</Text>
                <Text style={styles.listItemSub}>Global People & Culture Ops</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={Theme.colors.outline} style={{ opacity: 0.5 }} />
            </TouchableOpacity>
          </View>

          {/* Documents */}
          <Text style={styles.categoryTitle}>Documents</Text>
          <View style={[styles.categoryCard, Theme.elevation.level1]}>
            <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
              <MaterialIcons name="payments" size={22} color={Theme.colors.primary} />
              <View style={styles.listItemDetails}>
                <Text style={styles.listItemTitle}>Pay Slips</Text>
                <Text style={styles.listItemSub}>Last updated 3 days ago</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={Theme.colors.outline} style={{ opacity: 0.5 }} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
              <MaterialIcons name="description" size={22} color={Theme.colors.primary} />
              <View style={styles.listItemDetails}>
                <Text style={styles.listItemTitle}>Contracts</Text>
                <Text style={styles.listItemSub}>2 active agreements</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={Theme.colors.outline} style={{ opacity: 0.5 }} />
            </TouchableOpacity>
          </View>

          {/* Security Settings */}
          <Text style={styles.categoryTitle}>Security Settings</Text>
          <View style={[styles.categoryCard, Theme.elevation.level1]}>
            <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
              <MaterialIcons name="security" size={22} color={Theme.colors.primary} />
              <View style={styles.listItemDetails}>
                <Text style={styles.listItemTitle}>Password & 2FA</Text>
                <Text style={styles.listItemSub}>Last changed 2 months ago</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={Theme.colors.outline} style={{ opacity: 0.5 }} />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
            <MaterialIcons name="logout" size={22} color={Theme.colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
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

        <TouchableOpacity style={[styles.navItem, styles.navItemActive]} activeOpacity={0.8}>
          <MaterialIcons name="person" size={22} color={Theme.colors.primary} />
          <Text style={[styles.navText, styles.navTextActive]}>Profile</Text>
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
  headerLeft: {
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
    color: Theme.colors.onSurface,
  },
  settingsBtn: {
    padding: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: Theme.spacing.marginMobile,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarBorder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: Theme.colors.surfaceContainerHighest,
    overflow: 'hidden',
    backgroundColor: Theme.colors.secondaryContainer,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Theme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.surface,
  },
  userName: {
    fontSize: Theme.typography.headlineLgMobile.fontSize,
    fontFamily: Theme.typography.headlineLgMobile.fontFamily,
    fontWeight: '700',
    color: Theme.colors.onSurface,
  },
  userRole: {
    fontSize: Theme.typography.bodyLg.fontSize,
    fontFamily: Theme.typography.bodyLg.fontFamily,
    color: Theme.colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  userOrg: {
    fontSize: Theme.typography.bodyMd.fontSize,
    fontFamily: Theme.typography.bodyMd.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: Theme.spacing.marginMobile,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: Theme.colors.surfaceContainerLowest,
    borderRadius: Theme.rounded.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 214, 0.3)',
  },
  statLabel: {
    fontSize: Theme.typography.labelMd.fontSize,
    fontFamily: Theme.typography.labelMd.fontFamily,
    color: Theme.colors.onSurfaceVariant,
  },
  statValue: {
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
    fontWeight: '600',
    color: Theme.colors.onSurface,
    marginTop: 4,
  },
  listSection: {
    paddingHorizontal: Theme.spacing.marginMobile,
    gap: 8,
  },
  categoryTitle: {
    fontSize: Theme.typography.labelLg.fontSize,
    fontFamily: Theme.typography.labelLg.fontFamily,
    color: Theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 6,
    paddingLeft: 4,
  },
  categoryCard: {
    backgroundColor: Theme.colors.surfaceContainerLowest,
    borderRadius: Theme.rounded.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 214, 0.2)',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  listItemDetails: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: Theme.typography.bodyLg.fontSize,
    fontFamily: Theme.typography.bodyLg.fontFamily,
    color: Theme.colors.onSurface,
    fontWeight: '500',
  },
  listItemSub: {
    fontSize: Theme.typography.labelMd.fontSize,
    fontFamily: Theme.typography.labelMd.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.outlineVariant,
    opacity: 0.3,
    marginHorizontal: 16,
  },
  logoutBtn: {
    width: '100%',
    height: Theme.spacing.touchTarget,
    borderRadius: Theme.rounded.xl,
    borderWidth: 2,
    borderColor: 'rgba(186, 26, 26, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 24,
  },
  logoutText: {
    color: Theme.colors.error,
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
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
