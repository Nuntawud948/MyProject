/**
 * @file CustomButton.tsx
 * @description Reusable styled button matching the professional design theme.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { Theme } from '../theme';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        Theme.elevation.level2,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={Theme.colors.onPrimary} size="small" />
      ) : (
        <>
          <Text style={[styles.text, textStyle]}>{title}</Text>
          {icon && icon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: Theme.spacing.touchTarget, // 48px
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.rounded.xl, // 12px
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      web: {
        transition: 'all 0.2s ease-out',
        cursor: 'pointer',
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  text: {
    color: Theme.colors.onPrimary,
    fontFamily: Theme.typography.titleLg.fontFamily,
    fontSize: Theme.typography.titleLg.fontSize,
    fontWeight: '600',
  },
});
