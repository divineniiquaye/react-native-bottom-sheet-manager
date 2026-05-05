import RNBottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetFooterContainer,
  BottomSheetHandle,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetSectionList,
  BottomSheetTextInput,
  BottomSheetView,
  BottomSheetVirtualizedList,
} from "@gorhom/bottom-sheet";
import React from "react";
import {
  BackHandler,
  Platform,
  StyleSheet,
  View,
  type NativeEventSubscription,
} from "react-native";
import {
  Easing,
  interpolate,
  useAnimatedReaction,
  useSharedValue,
  type WithSpringConfig,
  type WithTimingConfig,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrivateManager } from "../manager";
import {
  useProviderContext,
  useSheetIDContext,
  useSheetRef,
  useSheetSharedContext,
  useStackBehaviorContext,
} from "../provider";
import { useSheetManager, useTeardownSheet } from "./shared";
import { BottomSheetInstance, BottomSheetProps, SheetIds, StackBehavior } from "../types";

interface BottomSheetFC
  extends React.MemoExoticComponent<React.ForwardRefExoticComponent<BottomSheetProps>> {
  <Id extends SheetIds>(
    props: BottomSheetProps<Id> & React.RefAttributes<BottomSheetInstance<Id>>,
  ): React.JSX.Element;

  // Components
  View: typeof BottomSheetView;
  ScrollView: typeof BottomSheetScrollView;
  FlatList: typeof BottomSheetFlatList;
  SectionList: typeof BottomSheetSectionList;
  VirtualizedList: typeof BottomSheetVirtualizedList;
  Handle: typeof BottomSheetHandle;
  Footer: typeof BottomSheetFooter;
  FooterContainer: typeof BottomSheetFooterContainer;
  Backdrop: typeof BottomSheetBackdrop;
  TextInput: typeof BottomSheetTextInput;
}

const FULL_SCREEN_POINTS: (string | number)[] =
  Platform.OS === "ios" ? ["%90", "90%"] : ["%93", "93%"];

const DEFAULT_SHEET_CLOSE_ANIMATION: WithTimingConfig = {
  duration: 300,
  easing: Easing.out(Easing.cubic),
};

const BottomSheetComponent = React.forwardRef<BottomSheetInstance, BottomSheetProps>(
  (
    {
      children,
      onClose,
      onBeforeShow,
      stackBehavior = "switch",
      hardwareBackPressToClose = true,
      enableDynamicSizing = false,
      iosModalSheetTypeOfAnimation,
      snapPoints: defaultSnapPoints,
      animatedIndex: defaultAnimatedIndex,
      onAnimate,
      style,
      passThrough,
      opacity,
      closeAnimationConfigs,
      ...props
    },
    ref,
  ) => {
    const currentSheetRef = useSheetRef();
    const currentCtx = useProviderContext();
    const stackContext = useStackBehaviorContext();

    const animatedIndex = useSharedValue(0);

    const [currentStackBehavior, setCurrentStackBehavior] =
      React.useState<StackBehavior>(stackBehavior);
    const isPushed = currentStackBehavior === "push";

    const { bottom } = useSafeAreaInsets();
    const defaultStyle = React.useMemo(() => ({ paddingBottom: bottom }), [bottom]);

    const effectiveCloseAnimation = React.useMemo(
      () => closeAnimationConfigs ?? DEFAULT_SHEET_CLOSE_ANIMATION,
      [closeAnimationConfigs],
    );

    const { fullScreenValues } = useSheetSharedContext();
    const [snapPoints, fullScreenIndex] = React.useMemo(() => {
      let resolved = defaultSnapPoints;

      if (
        Platform.OS === "android" &&
        iosModalSheetTypeOfAnimation &&
        Array.isArray(resolved)
      ) {
        resolved = resolved.map((p) => (p === "90%" || p === "%90" ? "93%" : p));
      }

      const fullScreenIndex =
        resolved instanceof Array
          ? resolved.findIndex((p) => FULL_SCREEN_POINTS.includes(p))
          : resolved?.value?.findIndex((p) => FULL_SCREEN_POINTS.includes(p)) || -1;

      return [resolved, fullScreenIndex] as const;
    }, [defaultSnapPoints, iosModalSheetTypeOfAnimation]);

    const valueRef = React.useRef<unknown>(null);
    const bottomSheetRef = React.useRef<BottomSheetModal>(null);
    const hardwareBackPressEvent = React.useRef<NativeEventSubscription>(
      null,
    ) as React.MutableRefObject<NativeEventSubscription>;
    const teardownDataRef = React.useRef<{ dismiss?: boolean; behavior?: StackBehavior }>(
      {},
    );
    const isClosingRef = React.useRef(false);

    const id = useSheetIDContext();
    const sheetId = props.id || id;

    const hideSheetRef = React.useRef<
      (
        data?: unknown,
        fromManager?: boolean,
        dismiss?: boolean,
        incomingBehavior?: StackBehavior,
      ) => void
    >(null!);

    useSheetManager({
      id: sheetId,
      onHide: (data, dismiss, behavior) => {
        // Update state for future renders, but also pass behavior directly
        // so hideSheet doesn't read a stale closure value (React state update
        // is async — hideSheet runs before the re-render).
        if (behavior) setCurrentStackBehavior(behavior);
        hideSheetRef.current(data, true, dismiss, behavior);
      },
      onBeforeShow: (data, behavior) => {
        if (behavior) setCurrentStackBehavior(behavior);
        onBeforeShow?.(data as never);
        valueRef.current = undefined;
        currentSheetRef.current = getInstance();
      },
      onContextUpdate: () => {
        if (sheetId) {
          PrivateManager.add(sheetId, currentCtx);
          PrivateManager.registerRef(sheetId, currentCtx, {
            current: getInstance(),
          } as React.RefObject<BottomSheetInstance>);
        }
      },
    });

    useAnimatedReaction(
      () => animatedIndex.value,
      (index) => {
        "worklet";
        if (defaultAnimatedIndex) {
          defaultAnimatedIndex.set(index);
        }

        if (iosModalSheetTypeOfAnimation && sheetId) {
          const val = interpolate(
            index,
            [fullScreenIndex - 0.5, fullScreenIndex, fullScreenIndex + 1],
            [0, 1, 0],
            "clamp",
          );
          const current = { ...fullScreenValues.value };
          current[sheetId] = val;
          fullScreenValues.set(current);
        }
      },
      [iosModalSheetTypeOfAnimation, sheetId],
    );

    React.useEffect(() => {
      return () => {
        if (iosModalSheetTypeOfAnimation && sheetId) {
          const current = { ...fullScreenValues.value };
          delete current[sheetId];
          fullScreenValues.set(current);
        }
      };
    }, [iosModalSheetTypeOfAnimation, sheetId, fullScreenValues]);

    const teardownSheet = useTeardownSheet({ sheetId, currentCtx });
    const hideSheet = React.useCallback(
      (
        data?: unknown,
        fromManager?: boolean,
        dismiss?: boolean,
        incomingBehavior?: StackBehavior,
      ) => {
        // Use the freshly-delivered behavior from the event when available.
        // currentStackBehavior comes from React state which may not have flushed
        // yet when this callback fires synchronously from the manager.
        const activeBehavior = incomingBehavior ?? currentStackBehavior;

        let value = data ?? valueRef.current;

        hardwareBackPressEvent.current?.remove();

        if (dismiss && activeBehavior === "push") {
          // For push behavior, a "dismiss" event means another sheet wants to
          // appear on top — do not close this sheet.
          if (fromManager) valueRef.current = data;
          return;
        }

        const shouldClose = activeBehavior !== "replace" || !dismiss;

        if (fromManager && shouldClose) {
          if (isClosingRef.current) return;
          isClosingRef.current = true;
          valueRef.current = value;
          teardownDataRef.current = { dismiss, behavior: activeBehavior };
          bottomSheetRef.current?.close(effectiveCloseAnimation);
          return;
        }

        const finalDismiss = fromManager ? dismiss : teardownDataRef.current.dismiss;
        const finalBehavior = fromManager
          ? activeBehavior
          : (teardownDataRef.current.behavior ?? activeBehavior);

        teardownDataRef.current = {};

        const closeValue = onClose?.(value as never);
        if (closeValue !== undefined) value = closeValue;

        teardownSheet(value, finalDismiss, finalBehavior);
        isClosingRef.current = false;
        if (fromManager) valueRef.current = data;
      },
      [currentStackBehavior, effectiveCloseAnimation, onClose, teardownSheet],
    );

    React.useEffect(() => {
      hideSheetRef.current = hideSheet;
    }, [hideSheet]);

    const getInstance = React.useCallback(
      (): BottomSheetInstance => ({
        close(options = {}): void {
          valueRef.current = (options as Record<string, unknown>).value;
          const opts = options as {
            animationConfigs?: WithSpringConfig | WithTimingConfig;
          };
          bottomSheetRef.current?.close(opts.animationConfigs ?? effectiveCloseAnimation);
        },
        expand(animationConfigs): void {
          bottomSheetRef.current?.expand(animationConfigs);
        },
        collapse(animationConfigs): void {
          bottomSheetRef.current?.collapse(animationConfigs);
        },
        snapToIndex(index: number, animationConfigs): void {
          bottomSheetRef.current?.snapToIndex(index, animationConfigs);
        },
        snapToPosition(position, animationConfigs): void {
          bottomSheetRef.current?.snapToPosition(position, animationConfigs);
        },
      }),
      [effectiveCloseAnimation],
    );

    React.useEffect(() => {
      if (sheetId) {
        PrivateManager.registerRef(sheetId, currentCtx, { current: getInstance() });
      }
      currentSheetRef.current = getInstance();
    }, [currentCtx, getInstance, sheetId, currentSheetRef]);

    React.useEffect(() => {
      if (Platform.OS === "android" && hardwareBackPressToClose) {
        hardwareBackPressEvent.current = BackHandler.addEventListener(
          "hardwareBackPress",
          () => {
            // Go through hideSheet so internal state (PrivateManager, events,
            // history) is updated correctly — not just the visual sheet.
            hideSheetRef.current(undefined, true, false);
            return true;
          },
        );
      }

      return () => hardwareBackPressEvent.current?.remove();
    }, [hardwareBackPressToClose]);

    React.useImperativeHandle(ref, getInstance, [getInstance]);

    const zIndex = React.useMemo(
      () => (isPushed && sheetId ? PrivateManager.zIndex(sheetId, currentCtx) : 0),
      [sheetId, isPushed, currentCtx],
    );

    const backdropOpacity = React.useMemo(() => {
      if (isPushed && stackContext.previousSheetId) {
        return (opacity || 0.45) * 0.6;
      }
      return opacity || 0.45;
    }, [isPushed, stackContext.previousSheetId, opacity]);

    return (
      <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { zIndex }]}>
        <RNBottomSheet
          enableDynamicSizing={enableDynamicSizing}
          backdropComponent={(backdropProps) => (
            <BottomSheetBackdrop
              enableTouchThrough={!!passThrough}
              opacity={backdropOpacity}
              disappearsOnIndex={-1}
              appearsOnIndex={0}
              {...backdropProps}
            />
          )}
          topInset={0}
          bottomInset={0}
          {...props}
          ref={bottomSheetRef}
          onClose={hideSheet}
          onAnimate={onAnimate}
          animatedIndex={animatedIndex}
          style={[defaultStyle, style]}
          snapPoints={enableDynamicSizing ? undefined : snapPoints}
        >
          {children}
        </RNBottomSheet>
      </View>
    );
  },
);

const BottomSheet = React.memo(BottomSheetComponent) as BottomSheetFC;
BottomSheet.displayName = "BottomSheet";

BottomSheet.View = BottomSheetView;
BottomSheet.ScrollView = BottomSheetScrollView;
BottomSheet.FlatList = BottomSheetFlatList;
BottomSheet.SectionList = BottomSheetSectionList;
BottomSheet.VirtualizedList = BottomSheetVirtualizedList;
BottomSheet.Handle = BottomSheetHandle;
BottomSheet.Footer = BottomSheetFooter;
BottomSheet.FooterContainer = BottomSheetFooterContainer;
BottomSheet.Backdrop = BottomSheetBackdrop;
BottomSheet.TextInput = BottomSheetTextInput;

export default BottomSheet;
