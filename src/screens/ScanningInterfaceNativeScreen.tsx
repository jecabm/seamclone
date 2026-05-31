import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, usePhotoOutput } from 'react-native-vision-camera';
import { DeviceMotion } from 'expo-sensors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { scanService } from '../services/firebase';
import { Point, ReferenceOrientation, RootStackParamList } from '../types';

type ScanningInterfaceProps = NativeStackScreenProps<RootStackParamList, 'ScanningInterface'>;

type DetectedCard = {
  orientation: ReferenceOrientation;
  widthPx: number;
  heightPx: number;
  overlayWidth: number;
  overlayHeight: number;
  overlayTop: number;
  overlayRight: number;
  confidence: number;
  corners: Point[];
};

const CARD_LONG_EDGE_MM = 85.6;

export const ScanningInterfaceNativeScreen: React.FC<ScanningInterfaceProps> = ({
  route,
  navigation,
}) => {
  const { projectId } = route.params;
  const { hasPermission, requestPermission } = useCameraPermission();
  const photoOutput = usePhotoOutput({
    qualityPrioritization: 'balanced',
  });
  const device = useCameraDevice('back');
  const [motionReady, setMotionReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [tiltDeg, setTiltDeg] = useState(90);
  const [tiltOk, setTiltOk] = useState(false);
  const [stableFrames, setStableFrames] = useState(0);
  const [referenceOrientation, setReferenceOrientation] = useState<ReferenceOrientation>('landscape');

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
  const captureEnabled = garmentEdgeDetected && scaleReferenceDetected && tiltOk;

  const detectedCard = useMemo<DetectedCard>(() => {
    const isLandscape = referenceOrientation === 'landscape';
    const widthPx = isLandscape ? 320 : 202;
    const heightPx = isLandscape ? 202 : 320;
    const overlayWidth = isLandscape ? 132 : 88;
    const overlayHeight = isLandscape ? 84 : 128;
    const overlayTop = isLandscape ? 398 : 372;
    const overlayRight = isLandscape ? 96 : 114;
    const confidence = Math.min(0.96, 0.46 + stableFrames / 20);

    const corners: Point[] = [
      { x: overlayRight, y: overlayTop },
      { x: overlayRight + overlayWidth, y: overlayTop },
      { x: overlayRight + overlayWidth, y: overlayTop + overlayHeight },
      { x: overlayRight, y: overlayTop + overlayHeight },
    ];

    return {
      orientation: referenceOrientation,
      widthPx,
      heightPx,
      overlayWidth,
      overlayHeight,
      overlayTop,
      overlayRight,
      confidence,
      corners,
    };
  }, [referenceOrientation, stableFrames]);

  useEffect(() => {
    if (hasPermission) {
      return;
    }

    requestPermission().catch(() => {
      Alert.alert('Camera permission required', 'Please enable camera access to scan garments.');
    });
  }, [hasPermission, requestPermission]);

  const handleCapture = async () => {
    if (!captureEnabled) {
      return;
    }

    setCapturing(true);
    try {
      const photo = await photoOutput.capturePhotoToFile(
        {
          enableShutterSound: false,
        },
        {}
      );

      const pixelsPerMm = detectedCard.widthPx / CARD_LONG_EDGE_MM;

      const scan = await scanService.createScan({
        projectId,
        rawImageUri: `file://${photo.filePath}`,
        referenceObject: {
          objectType: 'credit_card',
          widthPx: detectedCard.widthPx,
          heightPx: detectedCard.heightPx,
          confidence: detectedCard.confidence,
          detected: scaleReferenceDetected,
          orientation: detectedCard.orientation,
          corners: detectedCard.corners,
        },
        calibration: {
          ppm: pixelsPerMm,
          realWorldWidthMm: CARD_LONG_EDGE_MM,
          pixelWidth: detectedCard.widthPx,
          pixelHeight: detectedCard.heightPx,
        },
        validation: {
          tiltDeg,
          tiltOk,
          garmentEdgeDetected,
          scaleReferenceDetected,
          captureEnabled,
        },
      });

      navigation.replace('Rectification', { projectId, scanId: scan.id });
    } catch (error: any) {
      Alert.alert('Capture failed', error?.message || 'Unable to process the scan right now.');
    } finally {
      setCapturing(false);
    }
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.statusText}>Requesting camera permission...</Text>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Camera unavailable</Text>
        <Text style={styles.errorText}>No compatible back camera was found on this device.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Capture Garment</Text>
        <TouchableOpacity
          onPress={() =>
            setReferenceOrientation((current) =>
              current === 'landscape' ? 'portrait' : 'landscape'
            )
          }
        >
          <Ionicons name="sync-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.cameraShell}>
        <Camera style={StyleSheet.absoluteFill} device={device} isActive outputs={[photoOutput]} />
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.overlayFrame}>
            <Text style={styles.overlayLabel}>Align garment and reference card</Text>
          </View>
          <View
            style={[
              styles.referenceBox,
              {
                width: detectedCard.overlayWidth,
                height: detectedCard.overlayHeight,
                top: detectedCard.overlayTop,
                right: detectedCard.overlayRight,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.statusPanel}>
          <Text style={styles.statusTitle}>Capture readiness</Text>
          <Text style={styles.statusText}>
            Motion: {motionReady ? 'ready' : 'unavailable'} | Tilt: {tiltDeg.toFixed(1)} deg
          </Text>
          <Text style={styles.statusText}>
            Garment edge: {garmentEdgeDetected ? 'detected' : 'searching'} | Card:{' '}
            {scaleReferenceDetected ? 'locked' : 'searching'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.captureButton, !captureEnabled && styles.captureButtonDisabled]}
          onPress={handleCapture}
          disabled={!captureEnabled || capturing}
        >
          {capturing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.captureButtonText}>Capture Scan</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06111F',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#06111F',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  cameraShell: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0B1D33',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  overlayFrame: {
    margin: 16,
    marginTop: 24,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 17, 31, 0.6)',
  },
  overlayLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  referenceBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#7EE0B7',
    borderRadius: 12,
    backgroundColor: 'rgba(126, 224, 183, 0.12)',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  statusPanel: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#0B1D33',
    borderWidth: 1,
    borderColor: '#17304D',
  },
  statusTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  statusText: {
    color: '#D8E0EB',
    fontSize: 13,
    lineHeight: 20,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorText: {
    color: '#D8E0EB',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  captureButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#0066CC',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  captureButtonDisabled: {
    backgroundColor: '#35506E',
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
