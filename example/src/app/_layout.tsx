import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Slot } from "expo-router";

import { SheetProvider } from "@niibase/bottom-sheet-manager";

import "../sheets";

import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SheetProvider>
          <Slot />
        </SheetProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
