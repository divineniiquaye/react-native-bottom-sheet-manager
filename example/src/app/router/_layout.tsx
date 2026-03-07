import { Slot, withLayoutContext } from "expo-router";
import React from "react";

import {
  BottomSheetNavigationEventMap,
  BottomSheetNavigationOptions,
  BottomSheetNavigationState,
  createBottomSheetNavigator,
} from "@niibase/bottom-sheet-manager";

const { Navigator } = createBottomSheetNavigator();

/**
 * Bottom Sheet Navigator with Expo Router
 *
 * This layout demonstrates how to use the bottom sheet navigator with expo-router.
 * The first screen (index) is the main content rendered by NativeStackView,
 * and subsequent screens are rendered as bottom sheet modals.
 */
const BottomSheet = withLayoutContext<
  BottomSheetNavigationOptions,
  typeof Navigator,
  BottomSheetNavigationState<Record<string, object | undefined>>,
  BottomSheetNavigationEventMap
>(Navigator);

export const unstable_settings = {
  initialRouteName: "index",
};

export default function SheetsLayout() {
  // SSR guard - bottom sheet navigator doesn't work on server
  if (typeof window === "undefined") {
    return <Slot />;
  }

  return (
    <BottomSheet
      id={undefined}
      screenOptions={{
        enablePanDownToClose: true,
        enableDynamicSizing: false,
      }}
    >
      <BottomSheet.Screen name="index" />
      <BottomSheet.Screen name="profile" options={{ snapPoints: ["100%"] }} />
      <BottomSheet.Screen name="settings" options={{ snapPoints: ["60%", "90%"] }} />
      <BottomSheet.Screen
        name="comments"
        options={{
          snapPoints: ["65%", "90%"],
          keyboardBlurBehavior: "restore",
          enableBlurKeyboardOnGesture: true,
        }}
      />
    </BottomSheet>
  );
}
