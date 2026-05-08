import {
  createNavigatorFactory,
  EventArg,
  StackActions,
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

/**
 * Unified Navigator that renders the first screen as the base content
 * and all subsequent screens as bottom sheet overlays.
 *
 * Uses BottomSheetRouter (extending StackRouter) to manage navigation state,
 * with react-native-screens ScreenStack for the base screen rendering
 * and BottomSheetView for the sheet overlays.
 */
function Navigator({
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

  // Handle tab press → popToTop behavior
  React.useEffect(() => {
    // @ts-expect-error: there may not be a tab navigator in parent
    return navigation?.addListener?.("tabPress", (e: any) => {
      const isFocused = navigation.isFocused();

      requestAnimationFrame(() => {
        if (
          state.index > 0 &&
          isFocused &&
          !(e as EventArg<"tabPress", true>).defaultPrevented
        ) {
          navigation.dispatch({
            ...StackActions.popToTop(),
            target: state.key,
          });
        }
      });
    });
  }, [navigation, state.index, state.key]);

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
 * Creates a bottom sheet navigator that renders the first screen as the
 * main content and all subsequent screens as bottom sheet modals.
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
 *   return (
 *     <BottomSheet>
 *       <BottomSheet.Screen name="index" />
 *       <BottomSheet.Screen
 *         name="details"
 *         options={{ snapPoints: ["50%"] }}
 *       />
 *     </BottomSheet>
 *   );
 * }
 * ```
 */
export function createBottomSheetNavigator<
  const ParamList extends ParamListBase,
  const NavigatorID extends string | undefined = string | undefined,
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
    Navigator: typeof Navigator;
  },
  const Config extends StaticConfig<TypeBag> = StaticConfig<TypeBag>,
>(config?: Config): TypedNavigator<TypeBag, Config> {
  return createNavigatorFactory(Navigator)(config);
}

export * from "./types";
export { BottomSheetActions, useBottomSheetNavigation } from "./router";
