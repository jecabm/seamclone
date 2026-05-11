import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';

type ExportSettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'ExportSettings'>;

const paperSizes = [
  { id: 'A4', label: 'A4 (210 × 297 mm)', width: 210, height: 297 },
  { id: 'Letter', label: 'Letter (8.5 × 11 in)', width: 215.9, height: 279.4 },
  { id: 'A0', label: 'A0 (841 × 1189 mm)', width: 841, height: 1189 },
];

export const ExportSettingsScreen: React.FC<ExportSettingsScreenProps> = ({
  navigation,
}) => {
  const [selectedPaper, setSelectedPaper] = useState('A4');
  const [removeMargins, setRemoveMargins] = useState(true);
  const [showCropMarks, setShowCropMarks] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      // Simulate PDF generation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      Alert.alert(
        'Success',
        `PDF generated! 9 Tiled A4 Sheets (3×3)\n\nTotal Size: 594 × 841 mm\nPage Count: 9 A4 Sheets\nOverlap: 15 mm\nFile Format: Layered PDF\n\nReady for 1:1 scale printing.`
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'PDF generation failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Export & Print Settings</Text>
        <Ionicons name="help-circle-outline" size={28} color="#999" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>PRINT PREVIEW</Text>
          <View style={styles.previewBox}>
            <View style={styles.tileGrid}>
              {Array(9)
                .fill(0)
                .map((_, i) => (
                  <View key={i} style={styles.tile}>
                    <Text style={styles.tileLabel}>
                      {String.fromCharCode(65 + Math.floor(i / 3))}
                      {(i % 3) + 1}
                    </Text>
                  </View>
                ))}
            </View>
            <Text style={styles.previewText}>9 Tiles (3×3)</Text>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>DOCUMENT SETTINGS</Text>

          <View style={styles.settingBox}>
            <Text style={styles.settingLabel}>Paper Size</Text>
            {paperSizes.map((size) => (
              <TouchableOpacity
                key={size.id}
                style={[
                  styles.paperOption,
                  selectedPaper === size.id && styles.paperOptionSelected,
                ]}
                onPress={() => setSelectedPaper(size.id)}
              >
                <View
                  style={[
                    styles.paperCheckbox,
                    selectedPaper === size.id && styles.paperCheckboxSelected,
                  ]}
                >
                  {selectedPaper === size.id && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <Text style={styles.paperLabel}>{size.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.settingBox}>
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>Remove empty margins</Text>
                <Text style={styles.toggleSubtitle}>Minimize paper waste</Text>
              </View>
              <Switch
                value={removeMargins}
                onValueChange={setRemoveMargins}
                trackColor={{ false: '#ccc', true: '#81C784' }}
                thumbColor={removeMargins ? '#4CAF50' : '#fff'}
              />
            </View>
          </View>

          <View style={styles.settingBox}>
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>Include cut marks</Text>
                <Text style={styles.toggleSubtitle}>Dashed alignment guides</Text>
              </View>
              <Switch
                value={showCropMarks}
                onValueChange={setShowCropMarks}
                trackColor={{ false: '#ccc', true: '#81C784' }}
                thumbColor={showCropMarks ? '#4CAF50' : '#fff'}
              />
            </View>
          </View>
        </View>

        <View style={styles.exportDetailsSection}>
          <Text style={styles.sectionTitle}>EXPORT DETAILS</Text>
          <View style={styles.detailBox}>
            <DetailRow label="Total Size" value="594 × 841 mm" />
            <DetailRow label="Page Count" value="9 A4 Sheets" />
            <DetailRow label="Overlap" value="15 mm" />
            <DetailRow label="File Format" value="Layered PDF" />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#4CAF50" />
          <Text style={styles.infoText}>
            Ready for 1:1 scale printing. Print all 9 pages and measure against original garment
            to validate accuracy.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.downloadButton, downloading && styles.downloadButtonDisabled]}
          onPress={handleDownloadPDF}
          disabled={downloading}
        >
          {downloading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="download-outline" size={20} color="#fff" />
              <Text style={styles.downloadButtonText}>Download Tiled PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  previewSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  previewBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  tileGrid: {
    width: '100%',
    aspectRatio: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tile: {
    width: '33.33%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999',
  },
  previewText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  settingsSection: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  settingBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  settingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  paperOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  paperOptionSelected: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  paperCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paperCheckboxSelected: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  paperLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  exportDetailsSection: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  detailBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  infoBox: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#2E7D32',
    marginLeft: 8,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  downloadButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  downloadButtonDisabled: {
    opacity: 0.6,
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
