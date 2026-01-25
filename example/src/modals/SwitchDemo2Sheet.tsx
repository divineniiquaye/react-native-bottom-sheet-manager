import { ArrowRight, Layers, RefreshCw, X } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";

import {
  BottomSheet,
  SheetManager,
  SheetProps,
  useSheetRef,
} from "@niibase/bottom-sheet-manager";

const THEME_COLOR = "#3B82F6"; // Blue

const BEHAVIOR_COLORS = {
  switch: "#3B82F6",
  replace: "#10B981",
  push: "#8B5CF6",
};

const DEPTH = 2;
const SNAP_POINTS = ["78%"];

export default function SwitchDemo2Sheet({ id }: SheetProps<"switch-demo-2">) {
  const sheetRef = useSheetRef();

  const openNext = async () => {
    await SheetManager.show("switch-demo-3", {
      stackBehavior: "switch",
    });
  };

  const openWithBehavior = async (behavior: "replace" | "push") => {
    if (behavior === "replace") {
      await SheetManager.show("replace-demo-2", {
        stackBehavior: "replace",
      });
    } else {
      await SheetManager.show("push-demo-2", {
        stackBehavior: "push",
      });
    }
  };

  return (
    <BottomSheet
      id={id}
      snapPoints={SNAP_POINTS}
      stackBehavior="switch"
      handleIndicatorStyle={{ backgroundColor: THEME_COLOR }}
    >
      <BottomSheet.View style={styles.content}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.depthBadge}>
              <ArrowRight size={14} color="#FFF" />
              <Text style={styles.depthText}>Depth {DEPTH}</Text>
            </View>
            <View style={styles.behaviorBadge}>
              <ArrowRight size={16} color={THEME_COLOR} />
              <Text style={styles.behaviorText}>SWITCH</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.title}>Switch Behavior</Text>
            <Text style={styles.description}>
              Switch closes the current sheet before opening the new one. The
              previous sheet won't return when this one closes. This is the
              default behavior for modal transitions.
            </Text>
          </View>

          {/* Next Button */}
          <Pressable
            style={({ pressed }) => [styles.nextButton, pressed && styles.buttonPressed]}
            onPress={openNext}
          >
            <ArrowRight size={20} color="#FFF" />
            <Text style={styles.nextButtonText}>Go to Depth 3</Text>
          </Pressable>

          {/* Close Button */}
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.closeButtonPressed,
            ]}
            onPress={() => sheetRef.current?.close()}
          >
            <X size={18} color="#64748B" />
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>

        <View style={styles.actionsContainer}>
          {/* Switch to other behaviors */}
          <View style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>Or try another behavior:</Text>

            <View style={styles.actionsRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: BEHAVIOR_COLORS.replace },
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => openWithBehavior("replace")}
              >
                <RefreshCw size={18} color="#FFF" />
                <Text style={styles.actionButtonText}>Replace</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: BEHAVIOR_COLORS.push },
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => openWithBehavior("push")}
              >
                <Layers size={18} color="#FFF" />
                <Text style={styles.actionButtonText}>Push</Text>
              </Pressable>
            </View>
          </View>

          {/* Stack Info */}
          <View style={styles.stackInfo}>
            <Text style={styles.stackInfoText}>🔄 {DEPTH} sheet (no history)</Text>
          </View>
        </View>
      </BottomSheet.View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 12,
    justifyContent: "space-between",
    height: "100%",
  },
  container: {
    gap: 24,
  },
  header: {
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
    fontSize: 14,
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
    fontSize: 14,
    color: THEME_COLOR,
  },
  descriptionContainer: {
    gap: 6,
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
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: THEME_COLOR,
  },
  nextButtonText: {
    color: "#FFF",
    fontSize: 16,
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
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  actionsContainer: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  stackInfo: {
    alignItems: "center",
    paddingTop: 4,
  },
  stackInfoText: {
    fontSize: 13,
    color: "#94A3B8",
  },
});
