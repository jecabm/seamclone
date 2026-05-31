import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

type DevClientRequiredScreenProps = {
  actionLabel?: string;
  onActionPress?: () => void;
};

export const DevClientRequiredScreen: React.FC<DevClientRequiredScreenProps> = ({
  actionLabel,
  onActionPress,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Development Build Required</Text>
        <Text style={styles.body}>
          This app uses native camera modules that do not run in Expo Go.
        </Text>
        <Text style={styles.body}>
          Start Metro with dev-client mode and open the installed SeamClone
          development app on your phone.
        </Text>
        <View style={styles.codeBlock}>
          <Text style={styles.code}>npm run dev:iphone</Text>
        </View>
        {actionLabel && onActionPress ? (
          <TouchableOpacity style={styles.actionButton} onPress={onActionPress}>
            <Text style={styles.actionLabel}>{actionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D8E0EB',
    padding: 22,
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0B1D33',
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: '#31445A',
    textAlign: 'center',
  },
  codeBlock: {
    marginTop: 6,
    borderRadius: 10,
    backgroundColor: '#0B1D33',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  code: {
    color: '#F4F7FB',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  actionButton: {
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
