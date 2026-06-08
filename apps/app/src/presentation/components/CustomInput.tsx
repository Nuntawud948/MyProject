/**
 * @file CustomInput.tsx
 * @description Reusable React Native text input with floating label behavior.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Theme } from '../theme';

interface CustomInputProps extends TextInputProps {
  label: string;
  isPassword?: boolean;
  onRightIconPress?: () => void;
  rightIcon?: React.ReactNode;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  value = '',
  isPassword = false,
  onRightIconPress,
  rightIcon,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const animatedIsFocused = useRef(new Animated.Value(value !== '' ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: (isFocused || value !== '') ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  // Animate label position and font size
  const labelTop = animatedIsFocused.interpolate({
    inputRange: [0, 1],
    outputRange: [14, -8], // Moves label up above the border
  });

  const labelFontSize = animatedIsFocused.interpolate({
    inputRange: [0, 1],
    outputRange: [Theme.typography.bodyLg.fontSize, Theme.typography.labelLg.fontSize],
  });

  const labelColor = animatedIsFocused.interpolate({
    inputRange: [0, 1],
    outputRange: [Theme.colors.onSurfaceVariant, Theme.colors.primary],
  });

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.label,
          {
            top: labelTop,
            fontSize: labelFontSize,
            color: labelColor,
            backgroundColor: Theme.colors.surfaceContainerLowest,
          },
        ]}
      >
        {label}
      </Animated.Text>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
        ]}
      >
        <TextInput
          style={[styles.input, style]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          secureTextEntry={isPassword && !showPassword}
          placeholder=""
          placeholderTextColor="transparent"
          {...props}
        />
        {isPassword ? (
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPassword((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            style={styles.rightIconWrapper}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 20,
    width: '100%',
  },
  label: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
    paddingHorizontal: 4,
    fontFamily: Theme.typography.bodyMd.fontFamily,
    fontWeight: '500',
  },
  inputWrapper: {
    height: Theme.spacing.touchTarget, // 48px
    borderWidth: 1,
    borderColor: Theme.colors.outline,
    borderRadius: Theme.rounded.lg, // 8px
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  inputWrapperFocused: {
    borderColor: Theme.colors.primary,
    borderWidth: 2,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    color: Theme.colors.onSurface,
    fontSize: Theme.typography.bodyLg.fontSize,
    fontFamily: Theme.typography.bodyLg.fontFamily,
  },
  eyeBtn: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    height: '100%',
  },
  eyeIcon: {
    fontSize: 18,
  },
  rightIconWrapper: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    height: '100%',
  },
});
