/**
 * @file ManualCheckInModal.tsx
 * @description Modal for capturing a reason and photo on Manual check-in.
 * Styled to follow the professional WorkForce theme guidelines.
 */

import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { Theme } from '../../theme';

interface ManualCheckInModalProps {
  visible: boolean;
  latitude: number;
  longitude: number;
  onConfirm: (reason: string, imageUri: string) => Promise<void>;
  onCancel: () => void;
}

export function ManualCheckInModal({
  visible,
  latitude,
  longitude,
  onConfirm,
  onCancel,
}: ManualCheckInModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [reason, setReason] = useState('');
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
    if (!reason.trim()) {
      Alert.alert('Reason Required', 'Please enter a reason for manual check-in.');
      return;
    }
    if (!capturedUri) {
      Alert.alert('Photo Required', 'Please capture a photo before confirming.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim(), capturedUri);
      setReason('');
      setCapturedUri(null);
    } catch (err) {
      Alert.alert('Error', 'Check-in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.title}>Manual Check-In</Text>
          <View style={styles.gpsBadge}>
            <MaterialIcons name="gps-fixed" size={14} color={Theme.colors.onSurfaceVariant} />
            <Text style={styles.subtitle}>
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </Text>
          </View>
        </View>

        {/* ── Camera / Preview ─────────────────────────────────────────────── */}
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

        {/* ── Reason Input ─────────────────────────────────────────────────── */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Reason for manual request *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Why are you checking in manually?"
            placeholderTextColor={Theme.colors.onSurfaceVariant}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            maxLength={1000}
          />
          <Text style={styles.charCount}>{reason.length}/1000</Text>
        </View>

        {/* ── Actions ──────────────────────────────────────────────────────── */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onCancel}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.confirmBtn,
              (!capturedUri || !reason.trim() || isSubmitting) &&
                styles.confirmBtnDisabled,
            ]}
            onPress={handleConfirm}
            disabled={!capturedUri || !reason.trim() || isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Theme.colors.onPrimary} size="small" />
            ) : (
              <Text style={styles.confirmBtnText}>Submit Check-In</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    padding: Theme.spacing.marginMobile,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: Theme.typography.headlineLgMobile.fontSize,
    fontFamily: Theme.typography.headlineLgMobile.fontFamily,
    fontWeight: '700',
    color: Theme.colors.onSurface,
    marginBottom: 6,
  },
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.8,
  },
  subtitle: {
    fontSize: Theme.typography.labelLg.fontSize,
    fontFamily: Theme.typography.labelLg.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    fontVariant: ['tabular-nums'],
  },
  cameraSection: {
    marginBottom: 24,
    borderRadius: Theme.rounded.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 214, 0.3)',
  },
  cameraWrapper: {
    height: 280,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  captureBtn: {
    position: 'absolute',
    bottom: 16,
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
    height: 280,
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  retakeBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(25, 28, 29, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Theme.rounded.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  retakeBtnText: {
    color: '#FFF',
    fontSize: Theme.typography.labelLg.fontSize,
    fontFamily: Theme.typography.labelLg.fontFamily,
    fontWeight: '600',
  },
  permissionBtn: {
    height: 200,
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
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: Theme.typography.bodyLg.fontSize,
    fontFamily: Theme.typography.bodyLg.fontFamily,
    fontWeight: '600',
    color: Theme.colors.onSurface,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Theme.colors.surfaceContainerLowest,
    borderRadius: Theme.rounded.lg,
    borderWidth: 1,
    borderColor: Theme.colors.outline,
    color: Theme.colors.onSurface,
    fontSize: Theme.typography.bodyLg.fontSize,
    fontFamily: Theme.typography.bodyLg.fontFamily,
    padding: 14,
    textAlignVertical: 'top',
    height: 100,
  },
  charCount: {
    fontSize: Theme.typography.labelMd.fontSize,
    fontFamily: Theme.typography.labelMd.fontFamily,
    color: Theme.colors.onSurfaceVariant,
    textAlign: 'right',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: Theme.spacing.touchTarget,
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
    height: Theme.spacing.touchTarget,
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
