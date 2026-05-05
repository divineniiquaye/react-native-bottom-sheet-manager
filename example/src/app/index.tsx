import {
  ArrowRight,
  Compass,
  Layers,
  Layout,
  Maximize2,
  Music,
  RefreshCw,
  Sparkles,
} from "lucide-react-native";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import React from "react";

import { SheetManager } from "@niibase/bottom-sheet-manager";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Bottom Sheet</Text>
          <Text style={styles.subtitle}>Manager Examples</Text>
        </View>

        {/* Original Example */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic</Text>
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={async () => {
              const result = await SheetManager.show("example-sheet");
              if (typeof result === "number") {
                Alert.alert("Sheet Closed", `Closed at index: ${result}`);
              }
            }}
          >
            <View style={[styles.cardIcon, { backgroundColor: "#EFF6FF" }]}>
              <Sparkles size={24} color="#3B82F6" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Example Sheet</Text>
              <Text style={styles.cardDescription}>
                Original example with iOS modal and full screen animation
              </Text>
            </View>
            <ArrowRight size={20} color="#94A3B8" />
          </Pressable>
        </View>

        {/* Stack Behaviors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stack Behaviors</Text>

          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => {
              SheetManager.show("switch-demo-1");
            }}
          >
            <View style={[styles.cardIcon, { backgroundColor: "#DBEAFE" }]}>
              <ArrowRight size={24} color="#3B82F6" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Switch</Text>
              <Text style={styles.cardDescription}>Dismiss current, show new</Text>
            </View>
            <ArrowRight size={20} color="#94A3B8" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => {
              SheetManager.show("replace-demo-1");
            }}
          >
            <View style={[styles.cardIcon, { backgroundColor: "#D1FAE5" }]}>
              <RefreshCw size={24} color="#10B981" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Replace</Text>
              <Text style={styles.cardDescription}>Crossfade content swap</Text>
            </View>
            <ArrowRight size={20} color="#94A3B8" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => {
              SheetManager.show("push-demo-1");
            }}
          >
            <View style={[styles.cardIcon, { backgroundColor: "#EDE9FE" }]}>
              <Layers size={24} color="#8B5CF6" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Push</Text>
              <Text style={styles.cardDescription}>Stack sheets, pop to go back</Text>
            </View>
            <ArrowRight size={20} color="#94A3B8" />
          </Pressable>
        </View>

        {/* iOS Animation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>iOS Modal Animation</Text>

          <Pressable
            style={({ pressed }) => [
              styles.card,
              styles.cardDark,
              pressed && styles.cardPressed,
            ]}
            onPress={() => SheetManager.show("ios-modal")}
          >
            <View style={[styles.cardIcon, { backgroundColor: "#1E293B" }]}>
              <Music size={24} color="#10B981" />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, styles.cardTitleDark]}>Music Player</Text>
              <Text style={[styles.cardDescription, styles.cardDescriptionDark]}>
                Expand to see iOS-style scaling
              </Text>
            </View>
            <Maximize2 size={20} color="#64748B" />
          </Pressable>
        </View>

        {/* TrueSheet Demos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TrueSheet (Native)</Text>

          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => SheetManager.show("truesheet-basic")}
          >
            <View style={[styles.cardIcon, { backgroundColor: "#EDE9FE" }]}>
              <Sparkles size={24} color="#8B5CF6" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>TrueSheet Basic</Text>
              <Text style={styles.cardDescription}>
                Native detents, scrollable, grabber, expand/collapse
              </Text>
            </View>
            <ArrowRight size={20} color="#94A3B8" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => SheetManager.show("truesheet-header-footer")}
          >
            <View style={[styles.cardIcon, { backgroundColor: "#D1FAE5" }]}>
              <Layout size={24} color="#10B981" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Header & Footer</Text>
              <Text style={styles.cardDescription}>
                Fixed header, floating footer, native scrollable
              </Text>
            </View>
            <ArrowRight size={20} color="#94A3B8" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => SheetManager.show("truesheet-switch")}
          >
            <View style={[styles.cardIcon, { backgroundColor: "#DBEAFE" }]}>
              <ArrowRight size={24} color="#3B82F6" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Stack: Switch & Push</Text>
              <Text style={styles.cardDescription}>
                Switch and push behaviors with native TrueSheet
              </Text>
            </View>
            <ArrowRight size={20} color="#94A3B8" />
          </Pressable>
        </View>

        {/* Router Demo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Router Integration</Text>

          <Pressable
            style={({ pressed }) => [
              styles.card,
              styles.cardGradient,
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push("/router")}
          >
            <View style={[styles.cardIcon, { backgroundColor: "#FFF" }]}>
              <Compass size={24} color="#6366F1" />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, styles.cardTitleDark]}>Router Demo</Text>
              <Text style={[styles.cardDescription, styles.cardDescriptionDark]}>
                Bottom sheets as navigation screens
              </Text>
            </View>
            <ArrowRight size={20} color="#A5B4FC" />
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>@niibase/bottom-sheet-manager</Text>
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
    paddingBottom: 40,
  },

  // Header
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "300",
    color: "#64748B",
  },

  // Sections
  section: {
    marginBottom: 28,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
    marginLeft: 4,
  },

  // Cards
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardDark: {
    backgroundColor: "#0F172A",
  },
  cardGradient: {
    backgroundColor: "#6366F1",
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1E293B",
  },
  cardTitleDark: {
    color: "#FFF",
  },
  cardDescription: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  cardDescriptionDark: {
    color: "#94A3B8",
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingTop: 16,
  },
  footerText: {
    fontSize: 13,
    color: "#94A3B8",
    fontFamily: "monospace",
  },
});
