import {
  Bell,
  ChevronRight,
  Globe,
  Lock,
  Moon,
  Palette,
  Shield,
  Smartphone,
  X,
} from "lucide-react-native";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import React from "react";

import { BottomSheet, useBottomSheetNavigation } from "@niibase/bottom-sheet-manager";

export default function SettingsSheet() {
  const navigation = useBottomSheetNavigation();

  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  const [biometric, setBiometric] = React.useState(false);

  return (
    <BottomSheet.ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Pressable style={styles.closeButton} onPress={navigation.goBack}>
          <X size={20} color="#64748B" />
        </Pressable>
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.settingsList}>
          <View style={styles.settingItem}>
            <View style={[styles.settingIcon, { backgroundColor: "#1E293B" }]}>
              <Moon size={18} color="#FFF" />
            </View>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#E2E8F0", true: "#3B82F6" }}
              thumbColor="#FFF"
            />
          </View>

          <Pressable style={styles.settingItem}>
            <View style={[styles.settingIcon, { backgroundColor: "#8B5CF6" }]}>
              <Palette size={18} color="#FFF" />
            </View>
            <Text style={styles.settingLabel}>Theme Color</Text>
            <View style={styles.settingValueContainer}>
              <View style={[styles.colorDot, { backgroundColor: "#3B82F6" }]} />
              <ChevronRight size={18} color="#94A3B8" />
            </View>
          </Pressable>
        </View>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingsList}>
          <View style={styles.settingItem}>
            <View style={[styles.settingIcon, { backgroundColor: "#EF4444" }]}>
              <Bell size={18} color="#FFF" />
            </View>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#E2E8F0", true: "#3B82F6" }}
              thumbColor="#FFF"
            />
          </View>

          <Pressable style={styles.settingItem}>
            <View style={[styles.settingIcon, { backgroundColor: "#10B981" }]}>
              <Smartphone size={18} color="#FFF" />
            </View>
            <Text style={styles.settingLabel}>Sound & Haptics</Text>
            <ChevronRight size={18} color="#94A3B8" />
          </Pressable>
        </View>
      </View>

      {/* Privacy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Security</Text>
        <View style={styles.settingsList}>
          <View style={styles.settingItem}>
            <View style={[styles.settingIcon, { backgroundColor: "#3B82F6" }]}>
              <Lock size={18} color="#FFF" />
            </View>
            <Text style={styles.settingLabel}>Biometric Login</Text>
            <Switch
              value={biometric}
              onValueChange={setBiometric}
              trackColor={{ false: "#E2E8F0", true: "#3B82F6" }}
              thumbColor="#FFF"
            />
          </View>

          <Pressable style={styles.settingItem}>
            <View style={[styles.settingIcon, { backgroundColor: "#F59E0B" }]}>
              <Shield size={18} color="#FFF" />
            </View>
            <Text style={styles.settingLabel}>Privacy Settings</Text>
            <ChevronRight size={18} color="#94A3B8" />
          </Pressable>

          <Pressable style={styles.settingItem}>
            <View style={[styles.settingIcon, { backgroundColor: "#6366F1" }]}>
              <Globe size={18} color="#FFF" />
            </View>
            <Text style={styles.settingLabel}>Language</Text>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>English</Text>
              <ChevronRight size={18} color="#94A3B8" />
            </View>
          </Pressable>
        </View>
      </View>

      {/* Version Info */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0 (Build 42)</Text>
      </View>
    </BottomSheet.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingsList: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
  },
  settingValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingValue: {
    fontSize: 15,
    color: "#64748B",
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },

  // Version
  versionContainer: {
    alignItems: "center",
    paddingTop: 8,
  },
  versionText: {
    fontSize: 13,
    color: "#94A3B8",
  },
});
