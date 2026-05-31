import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../types';

type ScanningInterfaceProps = NativeStackScreenProps<RootStackParamList, 'ScanningInterface'>;

export const ScanningInterfaceScreen: React.FC<ScanningInterfaceProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="phone-portrait-outline" size={36} color="#0066CC" />
        <Text style={styles.title}>Camera Capture Is Mobile-Only</Text>
        <Text style={styles.text}>
          The guided capture flow uses native camera APIs and is available in the iOS/Android dev build.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D8E0EB',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    marginTop: 12,
    color: '#0B1D33',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  text: {
    marginTop: 10,
    color: '#31445A',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 18,
    backgroundColor: '#0066CC',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
