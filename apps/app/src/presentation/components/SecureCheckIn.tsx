import React, { useState } from 'react';
import { Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { Theme } from '../theme';

interface SecureCheckInProps {
  isClockedIn: boolean;
  isLoading: boolean;
  onCheckInAllowed: () => void;
  onSecurityBlock: () => void;
}

export const SecureCheckIn: React.FC<SecureCheckInProps> = ({ 
  isClockedIn, 
  isLoading, 
  onCheckInAllowed, 
  onSecurityBlock 
}) => {
  const [isVerifying, setIsVerifying] = useState(false);

  const handlePress = async () => {
    setIsVerifying(true);
    try {
      // 1. Double check foreground location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is needed for attendance.');
        setIsVerifying(false);
        return;
      }

      // 2. Fetch current position with High Accuracy instantly
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      
      // 3. Mock Location Detection (Fake GPS Prevention)
      if (loc.mocked) {
        Alert.alert(
          'Security Alert',
          'Please disable Fake GPS or Mock Location apps to check in.',
          [{ text: 'Understood' }]
        );
        onSecurityBlock();
        return;
      }

      // 4. Time Tampering Prevention
      // Component relies on backend timestamp. No timestamp generated here.
      
      onCheckInAllowed();
    } catch (err) {
      console.log('Error verifying location:', err);
      Alert.alert('Location Error', 'Unable to verify your location for security.');
    } finally {
      setIsVerifying(false);
    }
  };

  const disabled = isClockedIn || isLoading || isVerifying;

  return (
    <TouchableOpacity
      style={[
        styles.actionBtn,
        styles.checkInBtn,
        disabled && styles.btnDisabled,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {isVerifying ? (
        <ActivityIndicator size="small" color={isClockedIn ? Theme.colors.outline : Theme.colors.onPrimary} />
      ) : (
        <MaterialIcons
          name="login"
          size={22}
          color={isClockedIn ? Theme.colors.outline : Theme.colors.onPrimary}
        />
      )}
      <Text
        style={[
          styles.actionBtnText,
          { color: isClockedIn ? Theme.colors.outline : Theme.colors.onPrimary },
        ]}
      >
        {isVerifying ? 'Verifying...' : 'Check-In'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: Theme.rounded.lg,
    gap: 8,
  },
  checkInBtn: {
    backgroundColor: Theme.colors.primary,
  },
  btnDisabled: {
    backgroundColor: Theme.colors.surfaceContainerHighest,
  },
  actionBtnText: {
    fontSize: Theme.typography.labelLg.fontSize,
    fontFamily: Theme.typography.labelLg.fontFamily,
    fontWeight: '600',
  },
});
