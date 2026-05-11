import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/firebase';

type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await authService.logout();
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Logout failed');
          }
        },
      },
    ]);
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={24} color="#0066CC" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APP INFORMATION</Text>
          <SettingItem icon="information-circle-outline" title="About SeamClone" />
          <SettingItem
            icon="document-outline"
            title="Privacy Policy"
            subtitle="Learn how we protect your data"
          />
          <SettingItem
            icon="checkmark-circle-outline"
            title="Version"
            subtitle="v1.0.0-ALPHA"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SCANNING SETTINGS</Text>
          <SettingItem
            icon="image-outline"
            title="Image Quality"
            subtitle="Default: High (Coming Soon)"
          />
          <SettingItem
            icon="expand-outline"
            title="Bounding Box Size"
            subtitle="Adjust detection sensitivity (Coming Soon)"
          />
          <SettingItem
            icon="color-filter-outline"
            title="Edge Detection"
            subtitle="Configure sensitivity (Coming Soon)"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXPORT SETTINGS</Text>
          <SettingItem
            icon="document-text-outline"
            title="Default Paper Size"
            subtitle="A4 (Coming Soon)"
          />
          <SettingItem
            icon="settings-outline"
            title="PDF Preferences"
            subtitle="Margins, overlaps, crop marks (Coming Soon)"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <SettingItem icon="person-circle-outline" title="User Profile (Coming Soon)" />
          <TouchableOpacity
            style={[styles.settingItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, styles.logoutText]}>Logout</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Built ID: SC-7729-ALPHA</Text>
          <Text style={styles.supportText}>Support: support@seamclone.dev</Text>
        </View>
      </ScrollView>
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
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  logoutItem: {
    marginBottom: 12,
  },
  logoutText: {
    color: '#FF3B30',
  },
  footer: {
    marginTop: 40,
    marginBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  supportText: {
    fontSize: 12,
    color: '#0066CC',
    fontWeight: '600',
  },
});
