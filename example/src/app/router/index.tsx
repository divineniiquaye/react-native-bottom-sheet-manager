import {
  ArrowRight,
  Layers,
  Layout,
  MessageSquare,
  Music,
  Settings,
  User,
} from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import React from "react";

/**
 * Router Demo - Main Screen
 *
 * This is the main content screen for the router demo.
 * Pressing the buttons will navigate to bottom sheet screens.
 */
export default function RouterMainScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Router Demo</Text>
          <Text style={styles.subtitle}>Bottom sheets as navigation screens</Text>
        </View>

        {/* Navigation Cards */}
        <View style={styles.cardsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.card,
              styles.cardProfile,
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push("/router/profile")}
          >
            <View style={styles.cardIcon}>
              <User size={28} color="#3B82F6" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Profile</Text>
              <Text style={styles.cardDescription}>View and edit your profile</Text>
            </View>
            <ArrowRight size={20} color="#94A3B8" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.card,
              styles.cardSettings,
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push("/router/settings")}
          >
            <View style={styles.cardIcon}>
              <Settings size={28} color="#10B981" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Settings</Text>
              <Text style={styles.cardDescription}>App preferences & options</Text>
            </View>
            <ArrowRight size={20} color="#94A3B8" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.card,
              styles.cardComments,
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push("/router/comments")}
          >
            <View style={styles.cardIcon}>
              <MessageSquare size={28} color="#8B5CF6" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Comments</Text>
              <Text style={styles.cardDescription}>Full-screen iOS modal style</Text>
            </View>
            <ArrowRight size={20} color="#94A3B8" />
          </Pressable>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How it works</Text>
          <View style={styles.infoItem}>
            <Layout size={18} color="#64748B" />
            <Text style={styles.infoText}>
              Uses <Text style={styles.infoCode}>createBottomSheetNavigator</Text> with
              expo-router
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Layers size={18} color="#64748B" />
            <Text style={styles.infoText}>
              First screen is main content, rest are sheets
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Music size={18} color="#64748B" />
            <Text style={styles.infoText}>
              Supports <Text style={styles.infoCode}>iosModalSheetTypeOfAnimation</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  header: {
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
  },
  cardsContainer: {
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardProfile: {
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  cardSettings: {
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  cardComments: {
    borderLeftWidth: 4,
    borderLeftColor: "#8B5CF6",
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  cardDescription: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  infoSection: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  infoCode: {
    fontFamily: "monospace",
    backgroundColor: "#F1F5F9",
    color: "#0F172A",
  },
});
