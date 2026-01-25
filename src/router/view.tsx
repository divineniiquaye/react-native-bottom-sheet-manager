import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ParamListBase, useTheme } from "@react-navigation/native";
import { StatusBar, ViewStyle } from "react-native";
import * as React from "react";

import type {
  BottomSheetDescriptor,
  BottomSheetDescriptorMap,
  BottomSheetModalScreenProps,
  BottomSheetNavigationConfig,
  BottomSheetNavigationHelpers,
  BottomSheetNavigationState,
  BottomSheetRoute,
} from "./types";
import { BottomSheetActions } from "./router";

const DEFAULT_SNAP_POINTS = ["66%"];

function AnimatedSheetWrapper({
  route,
  navigation,
  descriptor,
  isFullScreen,
  previousIndex,
  defaultStyle,
  themeBackgroundStyle,
  themeHandleIndicatorStyle,
}: {
  route: BottomSheetRoute<ParamListBase>;
  navigation: BottomSheetNavigationHelpers;
  descriptor: BottomSheetDescriptor;
  isFullScreen: SharedValue<number>;
  previousIndex: SharedValue<number>;
  defaultStyle: ViewStyle;
  themeBackgroundStyle: ViewStyle;
  themeHandleIndicatorStyle: ViewStyle;
}) {
  const { options, render } = descriptor;
  const {
    index = 0,
    snapPoints = DEFAULT_SNAP_POINTS,
    animatedIndex: defaultAnimatedIndex,
    onAnimate,
    handleStyle,
    backgroundStyle,
    handleIndicatorStyle,
    enableDynamicSizing,
    iosModalSheetTypeOfAnimation,
    clickThrough,
    style,
    ...sheetProps
  } = options;

  // Calculate safe index
  const safeIndex = Math.min(route.snapToIndex ?? index, snapPoints.length - 1);

  // Create animatedIndex for this sheet
  const animatedIndex = useSharedValue(0);

  // Use animated reaction to watch animatedIndex and update isFullScreen reactively
  useAnimatedReaction(
    () => animatedIndex.value,
    (index) => {
      "worklet";
      if (defaultAnimatedIndex) {
        defaultAnimatedIndex.set(index);
      }

      if (!iosModalSheetTypeOfAnimation) {
        if (isFullScreen.value > 0) isFullScreen.set(0);
        previousIndex.set(index);
        return;
      }

      if (isFullScreen.value < 0) {
        isFullScreen.set(0);
      }

      const isClosing =
        index < 0 || (previousIndex.value >= 0 && index < previousIndex.value - 0.05);
      previousIndex.set(index);

      if (isClosing) {
        if (isFullScreen.value > 0.01) {
          isFullScreen.set(
            withTiming(0, {
              duration: 150 * 0.85,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }),
          );
        }
        return;
      }

      const points: (string | number)[] = ["%90", "90%"];
      const fullScreenIndex = snapPoints.findIndex((p: string | number) =>
        points.includes(p),
      );

      if (index >= fullScreenIndex - 0.5 && index <= fullScreenIndex + 0.5) {
        isFullScreen.set(1);
      } else if (index >= 0) {
        isFullScreen.set(0);
      }
    },
    [snapPoints, iosModalSheetTypeOfAnimation],
  );

  return (
    <BottomSheetModalScreen
      route={route}
      navigation={navigation}
      index={safeIndex}
      snapPoints={enableDynamicSizing ? undefined : snapPoints}
      enableDynamicSizing={enableDynamicSizing}
      animatedIndex={animatedIndex as any}
      clickThrough={clickThrough}
      animationConfigs={{
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }}
      onAnimate={(from, to, ...args) => {
        if (to >= isFullScreen.value && to > snapPoints.length - 1) {
          isFullScreen.set(0);
        } else if (to > 0 && to === previousIndex.value && isFullScreen.value === 0) {
          isFullScreen.set(1);
        }

        onAnimate?.(from, to, ...args);
      }}
      topInset={0}
      bottomInset={0}
      style={[defaultStyle, style]}
      backgroundStyle={[themeBackgroundStyle, backgroundStyle]}
      handleIndicatorStyle={[themeHandleIndicatorStyle, handleIndicatorStyle]}
      handleStyle={[themeBackgroundStyle, { borderRadius: 24 }, handleStyle]}
      {...sheetProps}
    >
      {render?.()}
    </BottomSheetModalScreen>
  );
}

function BottomSheetModalScreen({
  route,
  navigation,
  clickThrough,
  opacity,
  animatedIndex,
  onChange,
  children,
  ...props
}: BottomSheetModalScreenProps & { animatedIndex?: ReturnType<typeof useSharedValue> }) {
  const ref = React.useRef<BottomSheetModal>(null);
  const lastSnapIndexRef = React.useRef(route.snapToIndex ?? props.index ?? 0);

  // Present on mount.
  React.useEffect(() => {
    ref.current?.present();
  }, []);

  // Track mount state to avoid dismissing on unmount
  const isMounted = React.useRef(true);
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Handle route closing state
  React.useEffect(() => {
    if (route.closing) {
      ref.current?.dismiss();
    }
  }, [route.closing]);

  // Handle snap point changes from navigation actions
  React.useEffect(() => {
    if (route.snapToIndex != null && route.snapToIndex !== lastSnapIndexRef.current) {
      ref.current?.snapToIndex(route.snapToIndex);
      lastSnapIndexRef.current = route.snapToIndex;
    }
  }, [route.snapToIndex, route.snapToKey]);

  const handleChange = React.useCallback(
    (newIndex: number) => {
      const currentIndex = lastSnapIndexRef.current;
      lastSnapIndexRef.current = newIndex;

      if (newIndex >= 0 && newIndex !== currentIndex) {
        navigation.dispatch(BottomSheetActions.snapTo(newIndex));
      }
    },
    [navigation],
  );

  const handleDismiss = React.useCallback(() => {
    // BottomSheetModal will call onDismiss on unmount, but we don't want that
    // since we handle navigation state separately
    if (isMounted.current) {
      navigation.dispatch({
        ...BottomSheetActions.remove(),
        source: route.key,
      });
    }
  }, [navigation, route.key]);

  return (
    <BottomSheetModal
      {...props}
      ref={ref}
      onDismiss={handleDismiss}
      onChange={handleChange}
      animatedIndex={animatedIndex}
      index={props.index}
      backdropComponent={(backdropProps) => (
        <BottomSheetBackdrop
          {...backdropProps}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          enableTouchThrough={!!clickThrough}
          opacity={opacity ?? 0.45}
        />
      )}
    >
      {children}
    </BottomSheetModal>
  );
}

type Props = BottomSheetNavigationConfig & {
  state: BottomSheetNavigationState<ParamListBase>;
  navigation: BottomSheetNavigationHelpers;
  descriptors: BottomSheetDescriptorMap;
};

export function BottomSheetView({ state, navigation, descriptors }: Props) {
  const { colors } = useTheme();
  const { top, bottom, left, right } = useSafeAreaInsets();

  const themeBackgroundStyle = React.useMemo(
    () => ({
      borderCurve: "continuous" as unknown as undefined,
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    }),
    [colors.card],
  );

  const themeHandleIndicatorStyle = React.useMemo(
    () => ({
      backgroundColor: colors.border,
      height: 5,
      width: 50,
    }),
    [colors.border],
  );

  const defaultStyle = React.useMemo(
    () => ({
      paddingBottom: bottom,
      paddingLeft: left,
      paddingRight: right,
    }),
    [bottom, left, right],
  );

  // IOS modal sheet type of animation
  const isFullScreen = useSharedValue(-1);
  const previousIndex = useSharedValue(-1);

  const colorStyle = useAnimatedStyle(() => ({
    flex: 1,
    backgroundColor: withSpring(
      interpolateColor(isFullScreen.value, [0, 1], ["transparent", "#000"]),
      { duration: 150 },
    ),
  }));
  const animatedStyle = useAnimatedStyle(
    () => ({
      flex: 1,
      overflow: "hidden",
      borderRadius: interpolate(isFullScreen.value, [0, 0.8, 1], [0, 20, 24], "clamp"),
      transform: [
        {
          scaleX: withSpring(
            interpolate(isFullScreen.value, [0, 0.8], [1, 0.92], "clamp"),
            { duration: 150 },
          ),
        },
        {
          translateY: withSpring(
            interpolate(isFullScreen.value, [0, 0.8, 1], [0, top, top + 5], "clamp"),
            { duration: 150, dampingRatio: 1.5 },
          ),
        },
      ],
    }),
    [top],
  );

  // Since background color is white, we need to set status bar to light
  const setStatusBar = StatusBar.setBarStyle;
  useAnimatedReaction(
    () => isFullScreen.value,
    (currentValue) => {
      "worklet";
      if (currentValue > -1) {
        runOnJS(setStatusBar)(currentValue >= 0.5 ? "light-content" : "default");
      }
    },
    [],
  );

  // Get the base (first) route - this is the main content
  const baseRoute = state.routes[0];
  if (!baseRoute) {
    return null;
  }

  const baseDescriptor = descriptors[baseRoute.key];
  if (!baseDescriptor) {
    return null;
  }

  // Sheet routes are all routes after the base route
  const sheetRoutes = state.routes.slice(1);
  const hasSheets = sheetRoutes.length > 0;

  return (
    <>
      {/* Base content with iOS modal animation */}
      <Animated.View style={colorStyle}>
        <Animated.View style={animatedStyle}>{baseDescriptor.render?.()}</Animated.View>
      </Animated.View>

      {/* Bottom sheet modals */}
      {hasSheets && (
        <BottomSheetModalProvider>
          {sheetRoutes.map((route) => {
            // Skip routes that are being removed
            if (route.closing && !descriptors[route.key]) {
              return null;
            }

            const descriptor = descriptors[route.key];
            if (!descriptor) return null;

            return (
              <AnimatedSheetWrapper
                key={route.key}
                route={route}
                navigation={navigation}
                descriptor={descriptor}
                isFullScreen={isFullScreen}
                previousIndex={previousIndex}
                defaultStyle={defaultStyle}
                themeBackgroundStyle={themeBackgroundStyle}
                themeHandleIndicatorStyle={themeHandleIndicatorStyle}
              />
            );
          })}
        </BottomSheetModalProvider>
      )}
    </>
  );
}
