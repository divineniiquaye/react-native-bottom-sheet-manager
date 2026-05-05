import { ArrowRight, Layers, X } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { SheetManager, SheetProps, TrueSheet } from "@niibase/bottom-sheet-manager";

const THEME_COLOR = "#3B82F6";

export default function TrueSheetSwitch({ id }: SheetProps<"truesheet-switch">) {
  return (
    <TrueSheet id={id} detents={[0.7]} backgroundColor="#FFF" cornerRadius={28} grabber>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.topRow}>
          <View style={styles.depthBadge}>
            <ArrowRight size={14} color="#FFF" />
            <Text style={styles.depthText}>TrueSheet</Text>
          </View>
          <View style={styles.behaviorBadge}>
            <ArrowRight size={14} color={THEME_COLOR} />
            <Text style={styles.behaviorText}>SWITCH</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>Switch Behavior</Text>
          <Text style={styles.description}>
            Switch closes the current sheet before opening the next one. The previous
            sheet is pushed to the manager history and restored when the new sheet closes
            — all using native sheet presentation.
          </Text>
        </View>

        {/* Open next sheet */}
        <Pressable
          style={({ pressed }) => [styles.mainButton, pressed && styles.buttonPressed]}
          onPress={() =>
            SheetManager.show("truesheet-switch-2", { stackBehavior: "switch" })
          }
        >
          <ArrowRight size={20} color="#FFF" />
          <Text style={styles.mainButtonText}>Open Another Switch</Text>
        </Pressable>

        {/* Try push */}
        <View style={styles.altSection}>
          <Text style={styles.altLabel}>Or try:</Text>
          <Pressable
            style={({ pressed }) => [styles.altButton, pressed && styles.buttonPressed]}
            onPress={() => SheetManager.show("truesheet-push", { stackBehavior: "push" })}
          >
            <Layers size={18} color="#FFF" />
            <Text style={styles.altButtonText}>Push</Text>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.closeButton,
            pressed && styles.closeButtonPressed,
          ]}
          onPress={() => SheetManager.hide(id)}
        >
          <X size={18} color="#64748B" />
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </View>
    </TrueSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
    justifyContent: "space-between",
    height: "100%",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  depthBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: THEME_COLOR,
  },
  depthText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 13,
  },
  behaviorBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
  },
  behaviorText: {
    fontWeight: "600",
    fontSize: 13,
    color: THEME_COLOR,
  },
  body: {
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
  },
  description: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  mainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: THEME_COLOR,
  },
  mainButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  altSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  altLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  altButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#8B5CF6",
  },
  altButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  closeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
  closeButtonPressed: {
    backgroundColor: "#E2E8F0",
  },
  closeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
  },
});
