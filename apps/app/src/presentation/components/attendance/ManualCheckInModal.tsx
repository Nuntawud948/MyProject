/**
 * @file ManualCheckInModal.tsx
 * @description Modal for capturing a reason and photo on Manual check-in.
 * Opened from DashboardScreen when the user selects "Manual" check-in method.
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
import type { MobileImageFile } from '../../../data/dtos/attendance/clock-in.request';

// ── Props ──────────────────────────────────────────────────────────────────

interface ManualCheckInModalProps {
  visible: boolean;
  latitude: number;
  longitude: number;
  onConfirm: (reason: string, imageUri: string) => Promise<void>;
  onCancel: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────

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
      const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
      if (photo) setCapturedUri(photo.uri);
    } catch {
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
      // Reset state after success
      setReason('');
      setCapturedUri(null);
    } catch {
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
          <Text style={styles.subtitle}>
            📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </Text>
        </View>

        {/* ── Camera / Preview ─────────────────────────────────────────────── */}
        <View style={styles.cameraSection}>
          {capturedUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: capturedUri }} style={styles.preview} />
              <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake}>
                <Text style={styles.retakeBtnText}>↩ Retake</Text>
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
              >
                <View style={styles.captureBtnInner} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.permissionBtn}
              onPress={handleRequestPermission}
            >
              <Text style={styles.permissionBtnText}>
                📷 Allow Camera Access
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Reason Input ─────────────────────────────────────────────────── */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Reason *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Why are you checking in manually?"
            placeholderTextColor="#9CA3AF"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
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
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.confirmBtnText}>Submit Check-In</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Modal>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { padding: 24, paddingBottom: 48 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#F1F5F9', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#64748B', fontFamily: 'monospace' },

  cameraSection: { marginBottom: 24 },
  cameraWrapper: { borderRadius: 16, overflow: 'hidden', height: 280, position: 'relative' },
  camera: { flex: 1 },
  captureBtn: {
    position: 'absolute', bottom: 16,
    alignSelf: 'center',
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  captureBtnInner: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },
  previewContainer: { borderRadius: 16, overflow: 'hidden', height: 280 },
  preview: { width: '100%', height: '100%' },
  retakeBtn: {
    position: 'absolute', bottom: 12, right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  retakeBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  permissionBtn: {
    height: 120, borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#334155', borderStyle: 'dashed',
  },
  permissionBtnText: { color: '#94A3B8', fontSize: 16 },

  inputSection: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#CBD5E1', marginBottom: 8 },
  textInput: {
    backgroundColor: '#1E293B', borderRadius: 12,
    borderWidth: 1, borderColor: '#334155',
    color: '#F1F5F9', fontSize: 15, padding: 14,
    textAlignVertical: 'top',
  },
  charCount: { fontSize: 11, color: '#475569', textAlign: 'right', marginTop: 4 },

  actions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
  },
  cancelBtnText: { color: '#94A3B8', fontWeight: '600', fontSize: 16 },
  confirmBtn: {
    flex: 2, paddingVertical: 16, borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
  },
  confirmBtnDisabled: { backgroundColor: '#312E81', opacity: 0.5 },
  confirmBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
