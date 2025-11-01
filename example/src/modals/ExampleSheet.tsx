import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import React from "react";

import {
  BottomSheet,
  SheetManager,
  SheetProps,
  useSheetRef,
} from "@niibase/bottom-sheet-manager";

export default function ExampleSheet({ id }: SheetProps<"example-sheet">) {
  const [expand, setExpand] = React.useState(false);
  const sheetRef = useSheetRef();

  const pulse = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: Math.sin(pulse.value) * 4 }],
  }));

  React.useEffect(() => {
    pulse.value = withRepeat(
      withTiming(4 * Math.PI, { duration: 2000, easing: Easing.linear }),
    );
  }, []);

  return (
    <BottomSheet
      id={id}
      handleStyle={styles.handler}
      iosModalSheetTypeOfAnimation
      containerStyle={styles.bottomSheet}
      snapPoints={["60%", "100%"]}
      onChange={(index) => setExpand(index === 1)}
    >
      <BottomSheet.View style={styles.content}>
        <View style={styles.gap}>
          <Text style={styles.title}>Modal Sheet</Text>
          <Text style={styles.bodyText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim. Lorem ipsum
            dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
            ut labore et dolore magna aliqua. Ut enim ad minim Lorem ipsum dolor sit amet,
            consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim. Lorem ipsum dolor sit amet, consectetur
            adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna
            aliqua. Ut enim ad minim
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed ? styles.buttonPressed : null,
            ]}
            onPress={() => {
              setExpand(!expand);
              sheetRef.current.snapToIndex(expand ? 0 : 1);
            }}
          >
            <Animated.View style={[styles.buttonContent, animatedStyle]}>
              {expand ? (
                <ChevronUp size={36} color="#FFF" />
              ) : (
                <ChevronDown size={36} color="#FFF" />
              )}
            </Animated.View>
          </Pressable>
        </View>
        <Pressable onPress={() => SheetManager.hide(id)}>
          <Text>Close</Text>
        </Pressable>
      </BottomSheet.View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  bottomSheet: {
    borderRadius: 24,
  },
  handler: {
    borderRadius: 24,
  },
  content: {
    paddingTop: 24,
    paddingHorizontal: 16,
    height: "100%",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#6200ea",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  buttonPressed: {
    backgroundColor: "#3700b3",
  },
  buttonContent: {
    alignItems: "center",
  },
  gap: {
    gap: 16,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
  },
  bodyText: {
    marginVertical: 16,
  },
});
