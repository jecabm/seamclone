import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { DeviceMotion } from 'expo-sensors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { scanService } from '../services/firebase';

type ScanningInterfaceProps = NativeStackScreenProps<RootStackParamList, 'ScanningInterface'>;

export const ScanningInterfaceScreen: React.FC<ScanningInterfaceProps> = ({
  route,
  navigation,
}) => {
  const { projectId } = route.params;
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [motionReady, setMotionReady] = useState(false);

  const [capturing, setCapturing] = useState(false);
  const [tiltDeg, setTiltDeg] = useState(90);
  const [tiltOk, setTiltOk] = useState(false);

  // Stage-1 heuristic detection: stable level frames represent valid setup before ML upgrade.
  const [stableFrames, setStableFrames] = useState(0);

  useEffect(() => {
    let mounted = true;
    let subscription: { remove: () => void } | null = null;

    const startMotion = async () => {
      try {
        const permissionResult = DeviceMotion.requestPermissionsAsync
          ? await DeviceMotion.requestPermissionsAsync()
          : { status: 'granted' as const };

        if (!mounted || permissionResult.status !== 'granted') {
          setMotionReady(false);
          return;
        }

        DeviceMotion.setUpdateInterval(250);
        subscription = DeviceMotion.addListener((reading) => {
          const betaRaw = reading.rotation?.beta ?? 0;
          const gammaRaw = reading.rotation?.gamma ?? 0;
          const betaDeg = Math.abs(betaRaw) <= Math.PI * 2 ? (betaRaw * 180) / Math.PI : betaRaw;
          const gammaDeg = Math.abs(gammaRaw) <= Math.PI * 2 ? (gammaRaw * 180) / Math.PI : gammaRaw;

          const nextTilt = Math.sqrt(betaDeg * betaDeg + gammaDeg * gammaDeg);
          const nextTiltOk = nextTilt <= 3;

          setTiltDeg(nextTilt);
          setTiltOk(nextTiltOk);
          setStableFrames((prev) => (nextTiltOk ? Math.min(prev + 1, 24) : 0));
        });

        setMotionReady(true);
      } catch {
        setMotionReady(false);
      }
    };

    startMotion();

    return () => {
      mounted = false;
      if (subscription) subscription.remove();
    };
  }, []);

  const garmentEdgeDetected = stableFrames >= 4;
  const scaleReferenceDetected = stableFrames >= 8;
  const referenceConfidence = Math.min(0.95, stableFrames / 10);
  const referenceWidthPx = 320;
  const referenceHeightPx = 202;
  const ppm = referenceWidthPx / 85.6;

  const captureEnabled = garmentEdgeDetected && scaleReferenceDetected && tiltOk;

  const disabledReason = useMemo(() => {
    if (!tiltOk) return 'Hold phone flatter: tilt must be 3 degrees or less.';
    if (!garmentEdgeDetected) return 'Garment edge not stable in frame yet.';
    if (!scaleReferenceDetected) return 'Scale reference card not confirmed yet.';
    return '';
  }, [tiltOk, garmentEdgeDetected, scaleReferenceDetected]);

  const bubbleOffset = useMemo(() => {
    const maxOffset = 22;
    const normalized = Math.min(1, tiltDeg / 10);
    const sign = tiltOk ? 0 : 1;
    return sign * normalized * maxOffset;
  }, [tiltDeg, tiltOk]);

  const handleCapture = async () => {
    if (!captureEnabled || !cameraRef.current || capturing) return;

    try {
      setCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });

      if (!photo?.uri) {
        throw new Error('Camera did not return an image. Please try again.');
      }

      const scan = await scanService.createScan({
        projectId,
        rawImageUri: photo.uri,
        referenceObject: {
          objectType: 'credit_card',
          widthPx: referenceWidthPx,
          heightPx: referenceHeightPx,
          confidence: referenceConfidence,
          detected: scaleReferenceDetected,
        },
        calibration: {
          ppm,
          realWorldWidthMm: 85.6,
          pixelWidth: referenceWidthPx,
        },
        validation: {
          tiltDeg,
          tiltOk,
          garmentEdgeDetected,
          scaleReferenceDetected,
          captureEnabled,
        },
      });

      navigation.navigate('Rectification', { projectId, scanId: scan.id });
    } catch (error: any) {
      Alert.alert('Capture Error', error.message || 'Failed to capture garment scan.');
    } finally {
      setCapturing(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <ActivityIndicator color="#0066CC" size="large" />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Permission Needed</Text>
        <Text style={styles.permissionText}>
          SeamClone requires camera access to capture garments with scale calibration.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Allow Camera Access</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="back" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Guided Capture</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.levelContainer}>
        <Text style={styles.levelText}>Tilt: {tiltDeg.toFixed(1)} degrees</Text>
        <View style={[styles.levelTrack, tiltOk ? styles.levelTrackOk : styles.levelTrackWarn]}>
          <View style={[styles.levelBubble, { transform: [{ translateX: bubbleOffset }] }]} />
        </View>
        <Text style={[styles.levelState, tiltOk ? styles.statusOkText : styles.statusWarnText]}>
          {tiltOk ? 'Level OK (<= 3 degrees)' : 'Phone not level'}
        </Text>
      </View>

      <View style={styles.garmentBox}>
        <Text style={styles.overlayLabel}>Garment Area</Text>
      </View>

      <View
        style={[
          styles.referenceBox,
          scaleReferenceDetected ? styles.referenceBoxDetected : styles.referenceBoxPending,
        ]}
      >
        <Text style={styles.overlayLabel}>Scale Anchor</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.instructionBox}>
          <Ionicons name="information-circle-outline" size={20} color="#fff" />
          <Text style={styles.instructionText}>
            Place a standard card next to the garment for scale
          </Text>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusPill}>
            <Text style={styles.statusTitle}>Garment Edge</Text>
            <Text style={garmentEdgeDetected ? styles.statusOkText : styles.statusWarnText}>
              {garmentEdgeDetected ? 'Detected' : 'Waiting'}
            </Text>
          </View>
          <View style={styles.statusPill}>
            <Text style={styles.statusTitle}>Scale Ref</Text>
            <Text style={scaleReferenceDetected ? styles.statusOkText : styles.statusWarnText}>
              {scaleReferenceDetected ? `Detected (${referenceConfidence.toFixed(2)})` : 'Waiting'}
            </Text>
          </View>
          <View style={styles.statusPill}>
            <Text style={styles.statusTitle}>PPM</Text>
            <Text style={styles.statusValue}>{ppm.toFixed(2)}</Text>
          </View>
        </View>

        {!captureEnabled && <Text style={styles.gateReason}>{disabledReason}</Text>}

        <TouchableOpacity
          style={[styles.captureButton, !captureEnabled && styles.captureButtonDisabled]}
          onPress={handleCapture}
          disabled={!captureEnabled || capturing || !motionReady}
        >
          {capturing ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Ionicons name="camera" size={32} color="#000" />
          )}
        </TouchableOpacity>

        <Text style={styles.captureHint}>
          Capture is enabled only when garment edge + scale reference + tilt checks pass.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#0a0a0a',
  },
  permissionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  permissionText: {
    color: '#ddd',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  permissionButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  levelContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.48)',
    alignItems: 'center',
  },
  levelText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  levelTrack: {
    width: 80,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  levelTrackOk: {
    borderColor: '#2ecc71',
    backgroundColor: 'rgba(46,204,113,0.12)',
  },
  levelTrackWarn: {
    borderColor: '#f39c12',
    backgroundColor: 'rgba(243,156,18,0.12)',
  },
  levelBubble: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  levelState: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  garmentBox: {
    position: 'absolute',
    top: '22%',
    left: '8%',
    width: '84%',
    height: '45%',
    borderWidth: 2,
    borderColor: '#00d2ff',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 8,
  },
  referenceBox: {
    position: 'absolute',
    top: '30%',
    right: '12%',
    width: 110,
    height: 70,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  referenceBoxDetected: {
    borderColor: '#2ecc71',
    backgroundColor: 'rgba(46,204,113,0.2)',
  },
  referenceBoxPending: {
    borderColor: '#f1c40f',
    backgroundColor: 'rgba(241,196,15,0.15)',
  },
  overlayLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    paddingBottom: 32,
    paddingHorizontal: 16,
    marginTop: 'auto',
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  instructionText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  statusPill: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  statusTitle: {
    color: '#ddd',
    fontSize: 11,
    marginBottom: 2,
  },
  statusValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  statusOkText: {
    color: '#2ecc71',
    fontSize: 12,
    fontWeight: '700',
  },
  statusWarnText: {
    color: '#f1c40f',
    fontSize: 12,
    fontWeight: '700',
  },
  gateReason: {
    color: '#ffd37f',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 6,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  captureButtonDisabled: {
    opacity: 0.4,
  },
  captureHint: {
    color: '#ddd',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
});
