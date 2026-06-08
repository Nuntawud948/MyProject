/**
 * @file index.ts
 * @description Centralized Theme Design System matching the Professional HR Design specifications.
 */

import { Platform } from 'react-native';

export const Theme = {
  colors: {
    surface: '#f8f9fa',
    surfaceDim: '#d9dadb',
    surfaceBright: '#f8f9fa',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#f3f4f5',
    surfaceContainer: '#edeeef',
    surfaceContainerHigh: '#e7e8e9',
    surfaceContainerHighest: '#e1e3e4',
    onSurface: '#191c1d',
    onSurfaceVariant: '#414754',
    inverseSurface: '#2e3132',
    inverseOnSurface: '#f0f1f2',
    outline: '#727785',
    outlineVariant: '#c1c6d6',
    surfaceTint: '#005bc0',
    primary: '#005bbf',
    onPrimary: '#ffffff',
    primaryContainer: '#1a73e8',
    onPrimaryContainer: '#ffffff',
    inversePrimary: '#adc7ff',
    secondary: '#5b5f64',
    onSecondary: '#ffffff',
    secondaryContainer: '#dde0e6',
    onSecondaryContainer: '#5f6368',
    tertiary: '#9e4300',
    onTertiary: '#ffffff',
    tertiaryContainer: '#c55500',
    onTertiaryContainer: '#0e0200',
    error: '#ba1a1a',
    onError: '#ffffff',
    errorContainer: '#ffdad6',
    onErrorContainer: '#93000a',
    primaryFixed: '#d8e2ff',
    primaryFixedDim: '#adc7ff',
    onPrimaryFixed: '#001a41',
    onPrimaryFixedVariant: '#004493',
    secondaryFixed: '#dfe3e8',
    secondaryFixedDim: '#c3c7cc',
    onSecondaryFixed: '#181c20',
    onSecondaryFixedVariant: '#43474c',
    tertiaryFixed: '#ffdbcb',
    tertiaryFixedDim: '#ffb691',
    onTertiaryFixed: '#341100',
    onTertiaryFixedVariant: '#783100',
    background: '#f8f9fa',
    onBackground: '#191c1d',
    surfaceVariant: '#e1e3e4',

    // Semantic helpers
    success: '#15803d', // Tailwind green-700 for status
    successContainer: '#dcfce7',
    onSuccess: '#ffffff',
  },

  typography: {
    headlineLg: {
      fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
      letterSpacing: -0.5,
    },
    headlineLgMobile: {
      fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 32,
    },
    headlineMd: {
      fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
      fontSize: 22,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    titleLg: {
      fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    bodyLg: {
      fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodyMd: {
      fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    labelLg: {
      fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 16,
      letterSpacing: 0.5,
    },
    labelMd: {
      fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
      fontSize: 11,
      fontWeight: '500' as const,
      lineHeight: 16,
    },
  },

  rounded: {
    sm: 2,
    default: 4,
    md: 6,
    lg: 8,
    xl: 12,
    full: 9999,
  },

  spacing: {
    unit: 8,
    marginMobile: 16,
    marginTablet: 24,
    marginDesktop: 32,
    gutter: 16,
    touchTarget: 48,
  },

  elevation: {
    level0: {
      elevation: 0,
      shadowOpacity: 0,
    },
    level1: {
      ...Platform.select({
        ios: {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
        default: {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        },
      }),
    },
    level2: {
      ...Platform.select({
        ios: {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
        default: {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
        },
      }),
    },
  },
};
