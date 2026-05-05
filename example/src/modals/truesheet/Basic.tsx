import { ChevronDown, ChevronUp, Sparkles } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  SheetManager,
  SheetProps,
  TrueSheet,
  useSheetRef,
} from "@niibase/bottom-sheet-manager";

export default function TrueSheetBasic({ id }: SheetProps<"truesheet-basic">) {
  const [expanded, setExpanded] = React.useState(false);
  const sheetRef = useSheetRef();

  return (
    <TrueSheet
      id={id}
      detents={["auto", 0.7, 1]}
      cornerRadius={28}
      backgroundColor="#FFF"
      grabber
      dimmed={true}
      scrollable
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Sparkles size={32} color="#8B5CF6" />
          <Text style={styles.title}>TrueSheet Demo</Text>
        </View>

        <Text style={styles.body}>
          This sheet is powered by{" "}
          <Text style={styles.code}>@lodev09/react-native-true-sheet</Text> using native
          sheet presentation on both iOS and Android.
        </Text>

        <Text style={styles.section}>Detents</Text>
        <Text style={styles.body}>
          Three detents: <Text style={styles.code}>'auto'</Text> (sized to content),{" "}
          <Text style={styles.code}>0.7</Text> (70% of screen), and{" "}
          <Text style={styles.code}>1</Text> (full screen).
        </Text>

        <Text style={styles.section}>Controls</Text>

        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => {
              const next = !expanded;
              setExpanded(next);
              sheetRef.current?.snapToIndex(next ? 2 : 1);
            }}
          >
            {expanded ? (
              <ChevronDown size={20} color="#FFF" />
            ) : (
              <ChevronUp size={20} color="#FFF" />
            )}
            <Text style={styles.buttonText}>{expanded ? "Collapse" : "Expand"}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.buttonSecondary,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => SheetManager.hide(id)}
          >
            <Text style={styles.buttonSecondaryText}>Close</Text>
          </Pressable>
        </View>
      </ScrollView>
    </TrueSheet>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
  },
  section: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8B5CF6",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  body: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 22,
  },
  code: {
    fontFamily: "monospace",
    fontWeight: "600",
    color: "#8B5CF6",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#8B5CF6",
  },
  buttonSecondary: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
  },
});
