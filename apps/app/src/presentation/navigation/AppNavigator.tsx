/**
 * @file AppNavigator.tsx
 * @description Root navigator — switches between Auth stack and App stack
 * based on authentication state.
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { AuthProvider, useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { SimulationScreen } from '../screens/SimulationScreen';

// ── Stack Types ──────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Login: undefined;
};

import { ApplyForLeave } from '../screens/ApplyForLeave';
import { ScheduleScreen } from '../screens/ScheduleScreen';
import { LeaveDetailsScreen } from '../screens/LeaveDetailsScreen';
import { LeaveRequestDetails } from '../screens/LeaveRequestDetails';
import { ProfileScreen } from '../screens/ProfileScreen';

export type AppStackParamList = {
  Dashboard: undefined;
  Simulation: undefined;
  ApplyForLeave: undefined;
  Schedule: undefined;
  LeaveDetails: { id?: number };
  LeaveRequestDetails: { id: number };
  Profile: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

// ── Sub-navigators ────────────────────────────────────────────────────────────

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigatorInner() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Dashboard" component={DashboardScreen} />
      <AppStack.Screen name="Simulation" component={SimulationScreen} />
      <AppStack.Screen name="ApplyForLeave" component={ApplyForLeave} />
      <AppStack.Screen name="Schedule" component={ScheduleScreen} />
      <AppStack.Screen name="LeaveDetails" component={LeaveDetailsScreen} />
      <AppStack.Screen name="LeaveRequestDetails" component={LeaveRequestDetails} />
      <AppStack.Screen name="Profile" component={ProfileScreen} />
    </AppStack.Navigator>
  );
}

// ── Root Navigator Inner ──────────────────────────────────────────────────────

function AppNavigatorContent() {
  const { isAuthenticated, isLoading, restoreSession } = useAuth();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigatorInner /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

// ── Root Navigator ────────────────────────────────────────────────────────────

export function AppNavigator() {
  return (
    <AuthProvider>
      <AppNavigatorContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
