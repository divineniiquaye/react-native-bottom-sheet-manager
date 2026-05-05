import { ArrowRight, Layers, X } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { SheetManager, SheetProps, TrueSheet } from "@niibase/bottom-sheet-manager";

const THEME_COLOR = "#8B5CF6";

export default function TrueSheetPush({ id }: SheetProps<"truesheet-push">) {
  return (
    <TrueSheet
      id={id}
      detents={[0.5]}
      backgroundColor="#FFF"
      cornerRadius={28}
      dimmed={false}
      grabber
    >
      <View style={styles.container}>
        <View style={styles.topRow}>
          <View style={styles.depthBadge}>
            <Layers size={14} color="#FFF" />
            <Text style={styles.depthText}>TrueSheet</Text>
          </View>
          <View style={styles.behaviorBadge}>
            <Layers size={14} color={THEME_COLOR} />
            <Text style={styles.behaviorText}>PUSH</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>Push Behavior</Text>
          <Text style={styles.description}>
            Push stacks new sheets on top without closing the current one. The previous
            sheet stays open underneath. When the top sheet dismisses, the previous one is
            restored. Useful for quick settings or context menus.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.mainButton, pressed && styles.buttonPressed]}
          onPress={() => SheetManager.show("truesheet-push-2", { stackBehavior: "push" })}
        >
          <Layers size={20} color="#FFF" />
          <Text style={styles.mainButtonText}>Push Another</Text>
        </Pressable>

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
    backgroundColor: "#EDE9FE",
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
