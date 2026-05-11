import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Project } from '../types';
import { firestoreService } from '../services/firebase';
import { Ionicons } from '@expo/vector-icons';

type ProjectDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'ProjectDetail'>;

export const ProjectDetailScreen: React.FC<ProjectDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { projectId } = route.params;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const loadProject = async () => {
    try {
      const proj = await firestoreService.getProject(projectId);
      setProject(proj);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleStartScan = () => {
    navigation.navigate('ScanningInterface', { projectId });
  };

  const handleViewPatterns = () => {
    navigation.navigate('PatternPieces', { projectId });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Project not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>{project.title}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.projectInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}>
              <Text style={styles.statusText}>{project.status.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>{project.createdAt.toLocaleDateString()}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Updated</Text>
            <Text style={styles.infoValue}>{project.updatedAt.toLocaleDateString()}</Text>
          </View>

          {project.description && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Description</Text>
              <Text style={styles.infoValue}>{project.description}</Text>
            </View>
          )}
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>ACTIONS</Text>

          <TouchableOpacity style={styles.actionButton} onPress={handleStartScan}>
            <Ionicons name="camera-outline" size={24} color="#fff" />
            <View style={styles.actionButtonText}>
              <Text style={styles.actionButtonTitle}>Scan Garment</Text>
              <Text style={styles.actionButtonSubtitle}>
                Capture new scan or add to existing project
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={handleViewPatterns}
          >
            <Ionicons name="grid-outline" size={24} color="#0066CC" />
            <View style={styles.actionButtonText}>
              <Text style={styles.actionButtonTitleSecondary}>View Pattern Pieces</Text>
              <Text style={styles.actionButtonSubtitleSecondary}>
                Review extracted patterns
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#0066CC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => navigation.navigate('ExportSettings', { projectId })}
          >
            <Ionicons name="download-outline" size={24} color="#0066CC" />
            <View style={styles.actionButtonText}>
              <Text style={styles.actionButtonTitleSecondary}>Export & Print</Text>
              <Text style={styles.actionButtonSubtitleSecondary}>
                Generate tiled PDF for printing
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#0066CC" />
          </TouchableOpacity>
        </View>

        <View style={styles.placeholderSection}>
          <Text style={styles.sectionTitle}>PROJECT TIMELINE</Text>
          <View style={styles.placeholderBox}>
            <Ionicons name="time-outline" size={40} color="#ccc" />
            <Text style={styles.placeholderText}>No scans yet</Text>
            <Text style={styles.placeholderSubtext}>Start by scanning your garment</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'draft':
      return '#f0f0f0';
    case 'scanning':
      return '#FFA500';
    case 'editing':
      return '#4CAF50';
    case 'completed':
      return '#4CAF50';
    default:
      return '#ddd';
  }
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  projectInfo: {
    backgroundColor: '#fff',
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#333',
  },
  actionsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0066CC',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  actionButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0066CC',
  },
  actionButtonText: {
    flex: 1,
    marginLeft: 12,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  actionButtonTitleSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066CC',
    marginBottom: 2,
  },
  actionButtonSubtitle: {
    fontSize: 12,
    color: '#f0f0f0',
  },
  actionButtonSubtitleSecondary: {
    fontSize: 12,
    color: '#999',
  },
  placeholderSection: {
    marginTop: 24,
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  placeholderBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  placeholderSubtext: {
    fontSize: 12,
    color: '#999',
  },
});
