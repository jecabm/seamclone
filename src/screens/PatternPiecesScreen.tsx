import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';

type PatternPiecesScreenProps = NativeStackScreenProps<RootStackParamList, 'PatternPieces'>;

const mockPieces = [
  {
    id: '1',
    name: 'Front Panel',
    width: 60.0,
    height: 80.0,
    description: 'Main torso pattern segment',
  },
  {
    id: '2',
    name: 'Back Panel',
    width: 62.0,
    height: 80.0,
    description: 'Rear structural element',
  },
  {
    id: '3',
    name: 'Left Sleeve',
    width: 22.0,
    height: 60.0,
    description: 'Left articulation segment',
  },
];

export const PatternPiecesScreen: React.FC<PatternPiecesScreenProps> = ({
  route,
  navigation,
}) => {
  const { projectId } = route.params;

  const handleExport = () => {
    navigation.navigate('ExportSettings', { projectId });
  };

  const renderPiece = ({ item }: { item: typeof mockPieces[0] }) => (
    <View style={styles.pieceCard}>
      <View style={styles.piecePreview}>
        <Ionicons name="square-outline" size={60} color="#ccc" />
      </View>
      <View style={styles.pieceInfo}>
        <Text style={styles.pieceName}>{item.name}</Text>
        <Text style={styles.pieceDescription}>{item.description}</Text>
        <View style={styles.pieceDimensions}>
          <Text style={styles.dimensionText}>
            {item.width.toFixed(1)}cm × {item.height.toFixed(1)}cm
          </Text>
        </View>
      </View>
      <View style={styles.pieceActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="create-outline" size={18} color="#0066CC" />
          <Text style={styles.actionButtonText}>EDIT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.actionButtonAlt]}>
          <Ionicons name="download-outline" size={18} color="#fff" />
          <Text style={styles.actionButtonTextAlt}>EXPORT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Pattern Pieces</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Technical Blueprint Extraction for:</Text>
            <Text style={styles.infoValue}>SCAN_ID_9942</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>3 Pieces Detected</Text>
          </View>
        </View>

        <View style={styles.specSection}>
          <Text style={styles.sectionTitle}>GLOBAL SPECIFICATIONS</Text>
          <View style={styles.specGrid}>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Resolution</Text>
              <Text style={styles.specValue}>0.1mm Tolerance</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Seam Allowance</Text>
              <Text style={styles.specValue}>1.2cm Fixed</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Export Format</Text>
              <Text style={styles.specValue}>DXF/SVG/PDF</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Unit System</Text>
              <Text style={styles.specValue}>Metric (cm)</Text>
            </View>
          </View>
        </View>

        <View style={styles.piecesSection}>
          <FlatList
            data={mockPieces}
            renderItem={renderPiece}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={handleExport}>
          <Ionicons name="download-outline" size={20} color="#fff" />
          <Text style={styles.footerButtonText}>Export All</Text>
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
  headerInfo: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  infoRow: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    color: '#0066CC',
    fontWeight: '500',
  },
  specSection: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  specGrid: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  specItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  specLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  specValue: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },
  piecesSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  pieceCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  piecePreview: {
    backgroundColor: '#f9f9f9',
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieceInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pieceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  pieceDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  pieceDimensions: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  dimensionText: {
    fontSize: 11,
    color: '#0066CC',
    fontWeight: '600',
  },
  pieceActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0066CC',
    borderRadius: 6,
    paddingVertical: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0066CC',
  },
  actionButtonAlt: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  actionButtonTextAlt: {
    color: '#fff',
  },
  separator: {
    height: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  footerButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  footerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
