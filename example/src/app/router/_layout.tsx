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
 * The first screen (index) is the main content, and subsequent screens are rendered
 * as bottom sheets.
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
    />
  );
}
