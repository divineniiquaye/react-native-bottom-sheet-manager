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
import {
  BackHandler,
  Platform,
  StyleSheet,
  View,
  type NativeEventSubscription,
} from "react-native";
import {
  Easing,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import React from "react";

import {
  useProviderContext,
  useSheetAnimationContext,
  useSheetIDContext,
  useSheetRef,
  useStackBehaviorContext,
} from "./provider";
import { BottomSheetInstance, BottomSheetProps, SheetIds, StackBehavior } from "./types";
import { PrivateManager } from "./manager";
import { eventManager } from "./events";

interface BottomSheetFC
  extends React.MemoExoticComponent<React.ForwardRefExoticComponent<BottomSheetProps>> {
  <Id extends SheetIds>(
    props: BottomSheetProps & React.RefAttributes<BottomSheetInstance<Id>>,
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

const useSheetManager = ({
  id,
  onHide,
  onBeforeShow,
  onContextUpdate,
}: {
  id?: string;
  onHide: (data?: unknown, dismiss?: boolean, behavior?: StackBehavior) => void;
  onBeforeShow?: (data?: unknown, behavior?: StackBehavior) => void;
  onContextUpdate: () => void;
}) => {
  const currentContext = useProviderContext();
  const hasShownRef = React.useRef(false);

  React.useEffect(() => {
    if (!id) return undefined;

    const subscriptions = [
      eventManager.subscribe(
        `show_${id}`,
        (data: unknown, context?: string, behavior?: StackBehavior) => {
          if (currentContext !== context) return;
          if (!hasShownRef.current) {
            hasShownRef.current = true;
            onContextUpdate?.();
            onBeforeShow?.(data, behavior);
          }
        },
      ),
      eventManager.subscribe(
        `hide_${id}`,
        (data: unknown, context: string, dismiss?: boolean, behavior?: StackBehavior) => {
          if (currentContext !== context) return;
          hasShownRef.current = false;
          onHide?.(data, dismiss, behavior);
        },
      ),
    ];
    return () => {
      hasShownRef.current = false;
      subscriptions.forEach((s) => s?.unsubscribe?.());
    };
  }, [id, onHide, onBeforeShow, onContextUpdate, currentContext]);
};

const BottomSheetComponent = React.forwardRef<BottomSheetInstance, BottomSheetProps>(
  (
    {
      children,
      snapPoints,
      onClose,
      onBeforeShow,
      stackBehavior = "switch",
      hardwareBackPressToClose = true,
      enableDynamicSizing = false,
      handleIndicatorStyle,
      iosModalSheetTypeOfAnimation: pageAnimation,
      animatedIndex: defaultAnimatedIndex,
      backgroundStyle,
      onAnimate,
      handleStyle,
      style,
      clickThrough,
      opacity,

      ...props
    },
    ref,
  ) => {
    const currentSheetRef = useSheetRef();
    const currentCtx = useProviderContext();
    const stackContext = useStackBehaviorContext();

    const { isFullScreen, iosModalSheetTypeOfAnimation, duration } =
      useSheetAnimationContext();
    const animatedIndex = useSharedValue(0);
    const previousIndex = useSharedValue(-1);

    const [currentStackBehavior, setCurrentStackBehavior] =
      React.useState<StackBehavior>(stackBehavior);
    const isPushed = currentStackBehavior === "push";

    const { colors } = useTheme();
    const { bottom, left, right } = useSafeAreaInsets();

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

    const valueRef = React.useRef<unknown>(null);
    const bottomSheetRef = React.useRef<BottomSheetModal>(null);
    const hardwareBackPressEvent = React.useRef<NativeEventSubscription>(
      null,
    ) as React.MutableRefObject<NativeEventSubscription>;

    const id = useSheetIDContext();
    const sheetId = props.id || id;

    useSheetManager({
      id: sheetId,
      onHide: (data, dismiss, behavior) => {
        if (behavior) setCurrentStackBehavior(behavior);
        hideSheet(data, true, dismiss);
      },
      onBeforeShow: (data, behavior) => {
        if (behavior) setCurrentStackBehavior(behavior);
        onBeforeShow?.(data);
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
        ("worklet");
        if (defaultAnimatedIndex) {
          defaultAnimatedIndex.set(index);
        }

        if (!iosModalSheetTypeOfAnimation && !pageAnimation) {
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
                duration: duration * 0.85,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
              }),
            );
          }
          return;
        }

        const points: (string | number)[] = ["%90", "90%"];
        const fullScreenIndex =
          snapPoints instanceof Array
            ? snapPoints.findIndex((p) => points.includes(p))
            : snapPoints?.value?.findIndex((p) => points.includes(p)) || -1;

        if (index >= fullScreenIndex - 0.5 && index <= fullScreenIndex + 0.5) {
          isFullScreen.set(1);
        } else if (index >= 0) {
          isFullScreen.set(0);
        }
      },
      [snapPoints, iosModalSheetTypeOfAnimation, pageAnimation, duration],
    );

    const hideSheet = React.useCallback(
      (data?: unknown, fromManager?: boolean, dismiss?: boolean) => {
        let value = data ?? valueRef.current;

        hardwareBackPressEvent.current?.remove();

        const closeValue = onClose?.(value);
        if (closeValue !== undefined) value = closeValue;

        if (dismiss && currentStackBehavior === "push") {
          if (fromManager) valueRef.current = data;
          return;
        }

        if (currentStackBehavior !== "replace" || !dismiss) {
          bottomSheetRef.current?.close();
        }

        if (sheetId) {
          const hasHistory = PrivateManager.history.length > 0;
          const shouldRestorePrevious = currentStackBehavior !== "replace";

          eventManager.publish(
            `onclose_${sheetId}`,
            value,
            currentCtx,
            hasHistory || !!dismiss,
            currentStackBehavior,
          );

          if (shouldRestorePrevious) {
            if (dismiss) {
              PrivateManager.history.push({
                id: sheetId,
                context: currentCtx,
                behavior: currentStackBehavior,
              });
            } else if (hasHistory) {
              const prev = PrivateManager.history.pop()!;
              eventManager.publish(
                `show_wrap_${prev.id}`,
                undefined,
                prev.context,
                true,
                prev.behavior,
              );
            }
          }

          PrivateManager.remove(sheetId, currentCtx);
        }

        if (fromManager) valueRef.current = data;
      },
      [sheetId, currentCtx, onClose, currentStackBehavior],
    );

    const getInstance = React.useCallback(
      (): BottomSheetInstance => ({
        close(options = {}): void {
          valueRef.current = (options as Record<string, unknown>).value;
          bottomSheetRef.current?.close(options?.animationConfigs);
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
      [],
    );

    React.useEffect(() => {
      if (sheetId) {
        PrivateManager.registerRef(sheetId, currentCtx, {
          current: getInstance(),
        } as React.RefObject<BottomSheetInstance>);
      }
      currentSheetRef.current = getInstance();
    }, [currentCtx, getInstance, sheetId, currentSheetRef]);

    React.useEffect(() => {
      if (Platform.OS === "android" && hardwareBackPressToClose) {
        hardwareBackPressEvent.current = BackHandler.addEventListener(
          "hardwareBackPress",
          () => {
            bottomSheetRef.current?.close();
            return true;
          },
        );
      }

      return () => hardwareBackPressEvent.current?.remove();
    }, [hardwareBackPressToClose]);

    React.useImperativeHandle(ref, getInstance, [getInstance]);

    const zIndex = React.useMemo(() => {
      if (!sheetId) return 0;
      if (isPushed) {
        return PrivateManager.zIndex(sheetId, currentCtx);
      }
      return 0;
    }, [sheetId, isPushed, currentCtx]);

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
              enableTouchThrough={!!clickThrough}
              opacity={backdropOpacity}
              disappearsOnIndex={-1}
              appearsOnIndex={0}
              {...backdropProps}
            />
          )}
          onAnimate={(from, to, ...args) => {
            const snapPointLen = Array.isArray(snapPoints)
              ? snapPoints.length
              : (snapPoints?.value?.length ?? 0);

            if (to >= isFullScreen.value && to > snapPointLen - 1) {
              isFullScreen.set(0);
            } else if (to > 0 && to === previousIndex.value && isFullScreen.value === 0) {
              isFullScreen.set(1);
            }

            onAnimate?.(from, to, ...args);
          }}
          topInset={0}
          bottomInset={0}
          {...props}
          ref={bottomSheetRef}
          onClose={hideSheet}
          animatedIndex={animatedIndex}
          style={[defaultStyle, style]}
          snapPoints={enableDynamicSizing ? undefined : (snapPoints ?? ["66%"])}
          handleIndicatorStyle={[themeHandleIndicatorStyle, handleIndicatorStyle]}
          backgroundStyle={[themeBackgroundStyle, backgroundStyle]}
          handleStyle={[themeBackgroundStyle, handleStyle]}
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
