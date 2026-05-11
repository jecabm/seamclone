import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';

type NewScanScreenProps = NativeStackScreenProps<RootStackParamList, 'NewScan'>;

export const NewScanScreen: React.FC<NewScanScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>New Scan</Text>
        <Text style={styles.subtitle}>Scanning Interface (Coming Soon)</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.placeholder}>
          <Ionicons name="camera-outline" size={80} color="#ccc" />
          <Text style={styles.placeholderTitle}>Camera Interface</Text>
          <Text style={styles.placeholderText}>
            Phase 3: Camera view with bounding box overlay will be implemented here.
          </Text>
          <Text style={styles.placeholderSubtext}>
            • Persistent rectangular bounding box{'\n'}
            • Reference object indicator{'\n'}
            • Scale calibration interface
          </Text>
        </View>

        <TouchableOpacity
          style={styles.demoButton}
          onPress={() => navigation.navigate('Library')}
        >
          <Ionicons name="arrow-back" size={18} color="#0066CC" />
          <Text style={styles.demoButtonText}>Back to Library</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  placeholder: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 20,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  placeholderSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'left',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  demoButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0066CC',
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066CC',
    marginLeft: 8,
  },
});
