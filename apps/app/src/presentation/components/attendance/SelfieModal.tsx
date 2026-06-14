/**
 * @file SelfieModal.tsx
 * @description Lightweight reusable camera modal for Auto Check-In & Clock-Out flows.
 */

import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { Theme } from '../../theme';

interface SelfieModalProps {
  visible: boolean;
  onConfirm: (imageUri: string) => Promise<void>;
  onCancel: () => void;
  title?: string;
  subtitle?: string;
}

export function SelfieModal({
  visible,
  onConfirm,
  onCancel,
  title = "Verify Identity",
  subtitle = "Please take a selfie to verify your identity.",
}: SelfieModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const handleRequestPermission = async () => {
    await requestPermission();
  };

  const handleCapture = async () => {
    if (!cameraRef.current || !isCameraReady) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo) setCapturedUri(photo.uri);
    } catch (err) {
      Alert.alert('Camera Error', 'Failed to capture photo. Please try again.');
    }
  };

  const handleRetake = () => setCapturedUri(null);

  const handleConfirm = async () => {
    if (!capturedUri) {
      Alert.alert('Photo Required', 'Please capture a photo before confirming.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onConfirm(capturedUri);
      setCapturedUri(null);
    } catch (err) {
      // The parent component handles API error logging, we just reset state here.
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setCapturedUri(null);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {/* Camera / Preview */}
        <View style={[styles.cameraSection, Theme.elevation.level1]}>
          {capturedUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: capturedUri }} style={styles.preview} />
              <TouchableOpacity
                style={styles.retakeBtn}
                onPress={handleRetake}
                activeOpacity={0.8}
              >
                <MaterialIcons name="replay" size={16} color="#FFF" />
                <Text style={styles.retakeBtnText}>Retake</Text>
              </TouchableOpacity>
            </View>
          ) : permission?.granted ? (
            <View style={styles.cameraWrapper}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="front"
                onCameraReady={() => setIsCameraReady(true)}
              />
              <TouchableOpacity
                style={styles.captureBtn}
                onPress={handleCapture}
                disabled={!isCameraReady}
                activeOpacity={0.8}
              >
                <View style={styles.captureBtnInner} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.permissionBtn}
              onPress={handleRequestPermission}
              activeOpacity={0.7}
            >
              <MaterialIcons name="photo-camera" size={32} color={Theme.colors.outline} style={{ marginBottom: 8 }} />
              <Text style={styles.permissionBtnText}>
                Allow Camera Access
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancel}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.confirmBtn,
              (!capturedUri || isSubmitting) && styles.confirmBtnDisabled,
            ]}
            onPress={handleConfirm}
            disabled={!capturedUri || isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Theme.colors.onPrimary} size="small" />
            ) : (
              <Text style={styles.confirmBtnText}>Confirm</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.marginMobile,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: Theme.typography.headlineLgMobile.fontSize,
    fontFamily: Theme.typography.headlineLgMobile.fontFamily,
    fontWeight: '700',
    color: Theme.colors.onSurface,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Theme.typography.bodyLg.fontSize,
    fontFamily: Theme.typography.bodyLg.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  cameraSection: {
    marginBottom: 32,
    borderRadius: Theme.rounded.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 214, 0.3)',
    width: '100%',
    aspectRatio: 3 / 4,
    alignSelf: 'center',
  },
  cameraWrapper: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  captureBtn: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtnInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  retakeBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(25, 28, 29, 0.75)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Theme.rounded.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retakeBtnText: {
    color: '#FFF',
    fontSize: Theme.typography.labelLg.fontSize,
    fontFamily: Theme.typography.labelLg.fontFamily,
    fontWeight: '600',
  },
  permissionBtn: {
    flex: 1,
    backgroundColor: Theme.colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Theme.colors.outline,
    borderRadius: Theme.rounded.xl,
  },
  permissionBtnText: {
    color: Theme.colors.onSurfaceVariant,
    fontSize: Theme.typography.bodyLg.fontSize,
    fontFamily: Theme.typography.bodyLg.fontFamily,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 56,
    borderRadius: Theme.rounded.full,
    backgroundColor: Theme.colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: Theme.colors.onSurfaceVariant,
    fontWeight: '600',
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
  },
  confirmBtn: {
    flex: 2,
    height: 56,
    borderRadius: Theme.rounded.full,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: Theme.colors.primary,
    opacity: 0.4,
  },
  confirmBtnText: {
    color: Theme.colors.onPrimary,
    fontWeight: '600',
    fontSize: Theme.typography.titleLg.fontSize,
    fontFamily: Theme.typography.titleLg.fontFamily,
  },
});
