import { Layout, PanelBottom, X } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { SheetManager, SheetProps, TrueSheet } from "@niibase/bottom-sheet-manager";

export default function TrueSheetHeaderFooter({
  id,
}: SheetProps<"truesheet-header-footer">) {
  return (
    <TrueSheet
      id={id}
      detents={[0.5, 1]}
      cornerRadius={28}
      backgroundColor="#FFF"
      grabber
      scrollable
      header={
        <View style={styles.headerContainer}>
          <Layout size={20} color="#10B981" />
          <Text style={styles.headerTitle}>Header</Text>
          <Pressable style={styles.headerClose} onPress={() => SheetManager.hide(id)}>
            <X size={18} color="#64748B" />
          </Pressable>
        </View>
      }
      footer={
        <View style={styles.footerContainer}>
          <Pressable style={styles.footerButton} onPress={() => SheetManager.hide(id)}>
            <PanelBottom size={18} color="#FFF" />
            <Text style={styles.footerButtonText}>Dismiss</Text>
          </Pressable>
        </View>
      }
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Header & Footer Demo</Text>
        <Text style={styles.body}>
          TrueSheet supports fixed <Text style={styles.code}>header</Text> and{" "}
          <Text style={styles.code}>footer</Text> props that render in native container
          views. The header stays pinned to the top, and the footer floats at the bottom —
          no absolute positioning hacks needed.
        </Text>
        <Text style={styles.body}>
          The <Text style={styles.code}>scrollable</Text> prop auto-detects the ScrollView
          and handles nested scrolling correctly on both iOS and Android.
        </Text>
        <View style={styles.spacer} />
        <Text style={styles.body}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
          nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
          fugiat nulla pariatur.
        </Text>
      </ScrollView>
    </TrueSheet>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: "#1E293B",
  },
  headerClose: {
    padding: 4,
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#10B981",
  },
  footerButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
  },
  body: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 22,
  },
  code: {
    fontFamily: "monospace",
    fontWeight: "600",
    color: "#10B981",
  },
  spacer: { height: 8 },
});
