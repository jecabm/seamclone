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
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
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

export const ScanningInterfaceScreen: React.FC<ScanningInterfaceProps> = ({
  route,
  navigation,
}) => {
  const { projectId } = route.params;
  const cameraRef = useRef<Camera | null>(null);
  const { hasPermission, requestPermission } = useCameraPermission();
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

  const ppm = Math.max(detectedCard.widthPx, detectedCard.heightPx) / CARD_LONG_EDGE_MM;
  const mmPerPixel = 1 / ppm;

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
      const photo = await cameraRef.current.takePhoto();

      if (!photo?.path) {
        throw new Error('Camera did not return an image. Please try again.');
      }

      const imageUri = `file://${photo.path}`;

      const scan = await scanService.createScan({
        projectId,
        rawImageUri: imageUri,
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
          ppm,
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

      navigation.navigate('Rectification', { projectId, scanId: scan.id });
    } catch (error: any) {
      Alert.alert('Capture Error', error.message || 'Failed to capture garment scan.');
    } finally {
      setCapturing(false);
    }
  };

  if (!hasPermission) {
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

  if (!device) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>No Camera Device Found</Text>
        <Text style={styles.permissionText}>
          SeamClone could not find a back camera on this device.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        device={device}
        isActive
        photo
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Guided Capture</Text>
        <TouchableOpacity
          style={styles.orientationToggle}
          onPress={() =>
            setReferenceOrientation((current) =>
              current === 'landscape' ? 'portrait' : 'landscape'
            )
          }
        >
          <Ionicons name="sync-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.bannerContainer}>
        <Text style={styles.bannerText}>Place a standard card next to the garment for scale</Text>
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
          styles.detectedCardBox,
          {
            width: detectedCard.overlayWidth,
            height: detectedCard.overlayHeight,
            top: detectedCard.overlayTop,
            right: detectedCard.overlayRight,
          },
          scaleReferenceDetected ? styles.referenceBoxDetected : styles.referenceBoxPending,
        ]}
      >
        <View style={styles.cornerTopLeft} />
        <View style={styles.cornerTopRight} />
        <View style={styles.cornerBottomLeft} />
        <View style={styles.cornerBottomRight} />
      </View>

      {scaleReferenceDetected && (
        <View style={styles.scaleDetectedBox}>
          <Text style={styles.scaleDetectedTitle}>Scale Detected</Text>
          <Text style={styles.scaleDetectedText}>1 px = {mmPerPixel.toFixed(2)} mm</Text>
          <Text style={styles.scaleDetectedMeta}>
            {detectedCard.orientation} • {detectedCard.confidence.toFixed(2)} conf.
          </Text>
        </View>
      )}

      <View style={styles.footer}>
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
              {scaleReferenceDetected ? detectedCard.orientation : 'Waiting'}
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
            <>
              <Ionicons name="camera" size={30} color="#000" />
              <Text style={styles.captureButtonText}>Capture</Text>
            </>
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
  orientationToggle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  bannerContainer: {
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bannerText: {
    color: '#111',
    fontSize: 15,
    fontWeight: '600',
  },
  levelContainer: {
    position: 'absolute',
    right: 16,
    top: 70,
    width: 140,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  levelTrack: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelTrackOk: {
    borderColor: '#39d353',
    backgroundColor: 'rgba(57,211,83,0.18)',
  },
  levelTrackWarn: {
    borderColor: '#f1c40f',
    backgroundColor: 'rgba(241,196,15,0.14)',
  },
  levelBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#39d353',
    borderWidth: 1,
    borderColor: '#0c6119',
  },
  levelState: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
  },
  garmentBox: {
    position: 'absolute',
    top: 140,
    left: 36,
    width: 320,
    height: 310,
    borderWidth: 2,
    borderColor: '#57d3da',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 8,
  },
  overlayLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  detectedCardBox: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: 10,
  },
  referenceBoxDetected: {
    borderColor: '#39d353',
    backgroundColor: 'rgba(57,211,83,0.16)',
    shadowColor: '#39d353',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  referenceBoxPending: {
    borderColor: '#f1c40f',
    backgroundColor: 'rgba(241,196,15,0.1)',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 18,
    height: 18,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#39d353',
  },
  cornerTopRight: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#39d353',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: -4,
    left: -4,
    width: 18,
    height: 18,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#39d353',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#39d353',
  },
  scaleDetectedBox: {
    position: 'absolute',
    right: 18,
    top: 468,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(22,36,24,0.84)',
    borderWidth: 1,
    borderColor: 'rgba(57,211,83,0.75)',
  },
  scaleDetectedTitle: {
    color: '#6ce16b',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  scaleDetectedText: {
    color: '#d9ffe0',
    fontSize: 13,
    fontWeight: '600',
  },
  scaleDetectedMeta: {
    color: '#95d7a2',
    fontSize: 11,
    marginTop: 2,
  },
  footer: {
    paddingBottom: 30,
    paddingHorizontal: 16,
    marginTop: 'auto',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  statusPill: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.58)',
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
    color: '#39d353',
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
    width: 102,
    height: 102,
    borderRadius: 51,
    backgroundColor: '#61d56f',
    borderWidth: 4,
    borderColor: '#1483d4',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  captureButtonDisabled: {
    opacity: 0.4,
  },
  captureButtonText: {
    color: '#103b14',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
    textTransform: 'uppercase',
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
