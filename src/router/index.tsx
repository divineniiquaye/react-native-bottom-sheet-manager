import {
  createNavigatorFactory,
  useNavigationBuilder,
  type NavigatorTypeBagBase,
  type ParamListBase,
  type StaticConfig,
  type TypedNavigator,
} from "@react-navigation/native";
import * as React from "react";

import type {
  BottomSheetActionHelpers,
  BottomSheetNavigationEventMap,
  BottomSheetNavigationOptions,
  BottomSheetNavigationProp,
  BottomSheetNavigationState,
  BottomSheetNavigatorProps,
} from "./types";
import { BottomSheetRouter, type BottomSheetRouterOptions } from "./router";
import { BottomSheetView } from "./view";

function BottomSheetNavigator({
  id,
  children,
  screenListeners,
  screenOptions,
  initialRouteName,
  ...rest
}: BottomSheetNavigatorProps) {
  const { state, descriptors, navigation, NavigationContent } = useNavigationBuilder<
    BottomSheetNavigationState<ParamListBase>,
    BottomSheetRouterOptions,
    BottomSheetActionHelpers<ParamListBase>,
    BottomSheetNavigationOptions,
    BottomSheetNavigationEventMap
  >(BottomSheetRouter, {
    id,
    children,
    screenListeners,
    screenOptions,
    initialRouteName,
  });

  return (
    <NavigationContent>
      <BottomSheetView
        {...rest}
        state={state}
        navigation={navigation}
        descriptors={descriptors}
      />
    </NavigationContent>
  );
}

/**
 * Creates a bottom sheet navigator that renders screens as bottom sheet modals.
 *
 * The first screen in the navigator is rendered as the main content,
 * and subsequent screens are rendered as bottom sheet modals on top.
 *
 * @example
 * ```tsx
 * // With React Navigation
 * const { Navigator, Screen } = createBottomSheetNavigator();
 *
 * function App() {
 *   return (
 *     <Navigator>
 *       <Screen name="Home" component={HomeScreen} />
 *       <Screen
 *         name="Details"
 *         component={DetailsSheet}
 *         options={{ snapPoints: ['50%', '100%'] }}
 *       />
 *     </Navigator>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With Expo Router
 * import { Slot, withLayoutContext } from "expo-router";
 * import {
 *   createBottomSheetNavigator,
 *   BottomSheetNavigationOptions,
 *   BottomSheetNavigationEventMap,
 *   BottomSheetNavigationState,
 * } from "@niibase/bottom-sheet-manager";
 *
 * const { Navigator } = createBottomSheetNavigator();
 *
 * const BottomSheet = withLayoutContext<
 *   BottomSheetNavigationOptions,
 *   typeof Navigator,
 *   BottomSheetNavigationState<any>,
 *   BottomSheetNavigationEventMap
 * >(Navigator);
 *
 * export const unstable_settings = {
 *   initialRouteName: "index",
 * };
 *
 * export default function Layout() {
 *   // SSR guard - navigator doesn't work on server
 *   if (typeof window === "undefined") return <Slot />;
 *
 *   return <BottomSheet />;
 * }
 * ```
 */
export function createBottomSheetNavigator<
  const ParamList extends ParamListBase,
  const NavigatorID extends string | undefined = undefined,
  const TypeBag extends NavigatorTypeBagBase = {
    ParamList: ParamList;
    NavigatorID: NavigatorID;
    State: BottomSheetNavigationState<ParamList>;
    ScreenOptions: BottomSheetNavigationOptions;
    EventMap: BottomSheetNavigationEventMap;
    NavigationList: {
      [RouteName in keyof ParamList]: BottomSheetNavigationProp<
        ParamList,
        RouteName,
        NavigatorID
      >;
    };
    Navigator: typeof BottomSheetNavigator;
  },
  const Config extends StaticConfig<TypeBag> = StaticConfig<TypeBag>,
>(config?: Config): TypedNavigator<TypeBag, Config> {
  return createNavigatorFactory(BottomSheetNavigator)(config);
}

export * from "./types";
export { BottomSheetActions, useBottomSheetNavigation } from "./router";
